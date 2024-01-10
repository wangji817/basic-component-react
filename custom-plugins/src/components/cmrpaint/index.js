/**
 * 画笔基础组件
 * @param  props 
 * @returns 
 */
import './index.scss';
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import E from "../../utils/func";

const Cmrpaint = forwardRef((props, ref) => {
	const [options, setOptions] = useState({});
	const [drawCan, setDrawCan] = useState(null);
	const [drawCtx, setDrawCtx] = useState(null);

	useEffect(() => {
		init(props.options || {})
	}, [])
	const canvasId = `canvas_${new Date().getTime()}`;
	const noop = () => { }
	const debug = 1 ? console.log.bind(null, '[drawLing]') : noop;
	const PI = Math.PI;
	const pix = props.pix || 1;//默认倍数,如果是大于1则需要将画板重置倍数

	//绑定事件
	const addEventListener = (target, event, callback) => {
		target.addEventListener(event, callback, false);
		return {
			remove() {
				target.removeEventListener(event, callback, false);
			}
		}
	}

	//初始化画板
	const init = (_opt = {}) => {
		const _canvas = document.getElementById(canvasId);
		if (!_canvas) {
			console.log('未找到canvas，初始化失败');
			return
		};
		setDrawCan(_canvas);
		const _ctx = _canvas.getContext('2d');
		if (!_ctx) {
			console.log('未找到ctx，初始化画笔失败');
			return
		};
		setDrawCtx(_ctx)
		_opt = Object.assign({
			paintColor: '#000',
			backgroundColor: 'rgba(0, 0, 0, 0)',
			isHandWrittingModel: true,//模式，默认毛笔，否则是细笔
			maxWidth: 15,
			minWidth: 5,
			writeSpeed: 30, // 书写速度，关联控制速度与笔画粗细的阈值
			beforeWrite: noop,
			onWritting: noop, // 谨慎使用，可能造成性能问题
			afterWrite: noop,
		}, _opt);
		setOptions(_opt);
	}

	useEffect(() => {
		_resize();
		_reset();
		_bindEvents();
	}, [drawCtx])

	let lastPos = {};
	let _drawabled = false;
	let _isHandWrittingModel = true;
	let _lastRadius = 0;
	const _reset = () => {
		if (!drawCtx) return;
		drawCtx.fillStyle = options.paintColor;
		drawCtx.strokeStyle = options.paintColor;
		drawCtx.lineWidth = (options.maxWidth + options.minWidth) / 2;
		lastPos = {};
		_drawabled = false;
		_isHandWrittingModel = options.isHandWrittingModel;
	}

	const _resize = () => {
		if (!drawCtx) return;
		drawCan.width = props.width * pix;
		drawCan.height = props.height * pix;
		drawCtx.scale(pix, pix); // 画布内容放大相同的倍数
	}

	const _bindEvents = () => {
		if (_isMobile()) {
			_addTouchEvent();
		} else {
			_addMouseEvent();
		}
	}

	//手机触摸事件绑定
	let _touchstartEvent, _touchmoveEvent, _touchendEvent;
	const _addTouchEvent = () => {
		if (!drawCan) return;
		_touchstartEvent = addEventListener(drawCan, 'touchstart', _start);
		_touchmoveEvent = addEventListener(drawCan, 'touchmove', _move);
		_touchendEvent = addEventListener(document, 'touchend', _end);
	}

	//pc鼠标事件绑定
	let _mousedownEvent, _mousemoveEvent, _mouseleaveEvent, _mouseupEvent;
	const _addMouseEvent = () => {
		if (!drawCan) return;
		_mousedownEvent = addEventListener(drawCan, 'mousedown', _start);
		_mousemoveEvent = addEventListener(drawCan, 'mousemove', _move);
		_mouseleaveEvent = addEventListener(drawCan, 'mouseleave', _end);
		_mouseupEvent = addEventListener(document, 'mouseup', _end);
	}

	const _removeTouchEvent = () => {
		_touchstartEvent && _touchstartEvent.remove();
		_touchmoveEvent && _touchmoveEvent.remove();
		_touchendEvent && _touchendEvent.remove();
	}

	const _removeMouseEvent = () => {
		_mousedownEvent && _mousedownEvent.remove();
		_mousemoveEvent && _mousemoveEvent.remove();
		_mouseupEvent && _mouseupEvent.remove();
		_mouseleaveEvent && _mouseleaveEvent.remove();
	}

	const _isMobile = () => {
		return /android|iphone|ios|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
	}

	const _start = (e) => {
		e && e.preventDefault();
		const pos = _getCoordinate(e);
		debug('start', pos)
		options.beforeWrite(e, pos);
		_drawabled = true;
		if (!_isHandWrittingModel) {
			drawCtx.beginPath();
			drawCtx.moveTo(pos.x, pos.y);
		}
		_draw(pos);
	}

	const _move = (e) => {
		if (_drawabled) {
			e && e.preventDefault();
			_throttleDraw(e);
		}
	}

	const _end = (e) => {
		if (_drawabled) {
			e && e.preventDefault();
			const pos = _getCoordinate(e);
			options.afterWrite(e, pos);
			_draw(pos);
		}
		_drawabled = false;
		lastPos = {};
		_lastRadius = 0;
	}

	const _throttleDraw = (e) => {
		requestAnimationFrame(() => {
			if (_drawabled) {
				const pos = _getCoordinate(e);
				options.onWritting(e, pos);
				_draw(pos);
			}
		});
	}

	const _draw = (pos) => {
		if (_isHandWrittingModel) {
			_drawWithArc(pos);
		} else {
			_drawWithLine(pos);
		}
	}

	const _drawWithLine = (pos) => {
		drawCtx.lineTo(pos.x, pos.y);
		drawCtx.stroke();
	}

	const _drawWithArc = (pos) => {
		const distance = _getDistance(pos, lastPos);
		if (distance < 2) { return false; } // 避免单点

		const threshold = options.writeSpeed; // 移速相关，过大或过小都会造成笔画粗细不明显
		const rate = distance > threshold ? 1 : distance / threshold;
		const midWidth = drawCtx.lineWidth;
		const radius = midWidth / 2;
		const wave = midWidth - options.minWidth;
		const finalRadius = radius + wave * (1 - rate - 0.5); // 本次笔画的目标粗细， _lastRadius 为上一次笔画最终粗细

		const len = Math.round(distance / 2) + 1;
		for (let i = 0, thisRadius = 0; i < len; i++) { // 由于画的是圆，需要在两个圆之前添加补间，形成笔画
			const x = lastPos.x + (pos.x - lastPos.x) / len * i;
			const y = lastPos.y + (pos.y - lastPos.y) / len * i;
			thisRadius = _lastRadius + (finalRadius - _lastRadius) / len * i;
			drawCtx.beginPath();
			drawCtx.arc(x, y, thisRadius, 0, 2 * PI);
			drawCtx.fill();
		}
		_lastRadius = finalRadius;

		lastPos.x = pos.x;
		lastPos.y = pos.y;
		// Todo 因为中文方正，表现还好，但是对于画圆，笔画会有棱角，不圆滑，需要贝塞尔曲线，计算量稍增。
	}
	let _canvasBounding;
	const _getCanvasBounding = () => {
		if (_drawabled) { // 只在 _start的时候重新读取布局
			return _canvasBounding;
		}
		_canvasBounding = drawCan.getBoundingClientRect();
		return _canvasBounding;
	}

	const _getCoordinate = (e) => {
		const { left, top } = _getCanvasBounding();
		e = _isMobile() ? e.touches[0] : e;
		if (!e || !e.clientX) return;
		return {
			x: e.clientX - left + 0.5,
			y: e.clientY - top + 0.5,
		}
	}

	const _getDistance = (pos1, pos2) => {
		if (!pos1 || !pos2) {
			return 0;
		}
		const dx = pos1.x - pos2.x;
		const dy = pos1.y - pos2.y;
		return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
	}

	//注销事件，清除画板
	const destroy = () => {
		_removeTouchEvent();
		_removeMouseEvent();
		clear();
	}

	//清除画板，重置
	const clear = () => {
		drawCtx.clearRect(0, 0, drawCan.width, drawCan.height);
		drawCtx.fillStyle = options.backgroundColor;
		drawCtx.fillRect(0, 0, drawCan.width, drawCan.height);
		_reset();
	}

	//设置毛笔模式
	const handWrittingModel = () => {
		_isHandWrittingModel = true;
	}

	//设置普通模式
	const linearModel = () => {
		_isHandWrittingModel = false;
	}

	const _formatType = (type) => {
		type = type.toLowerCase().replace(/jpg/i, 'jpeg');
		type = 'image/' + type.match(/png|jpeg|bmp|gif/)[0];
		return type;
	}

	//获取截屏的base64图
	const getImgData = (type = 'png') => {
		type = _formatType(type);
		return drawCan.toDataURL(type);
	}

	//去下载
	const downloadImage = (type = 'png') => {
		type = _formatType(type);
		const url = drawCan.toDataURL(type).replace(type, 'image/octet-stream');
		document.location.href = url;
	}

	//将本组件自定义事件暴露给父组件的实例值
	useImperativeHandle(ref, () => ({
		getImgData,
		downloadImage,
		handWrittingModel,
		linearModel,
		destroy,
	}))

	return (
		<div className={`Cmrpaint ${props.className}`}>
			<canvas id={canvasId}></canvas>
		</div>
	)
})

export default Cmrpaint;