/**
 * CmrCustVideo
 * @author 此处修改作者名
 * @property {object} data 
 * @example 
 <CmrCustVideo data={{
		videoUrl:"视频地址",
		paddingSize: "15",//间距
		className: "my-class",//我的类名，用于复写样式
		initFlag: true,//默认true，引用组件一开始就渲染创建视频对象，false是不主动创建video，需要调用initVideo
		isFull: false,//默认false，是否全屏播放，默认窗口播放，true时，全屏播放
		childrenPosition: "top",子组件元素位置，默认top，在render的最上面，具体可看代码，枚举值，top，bottom
		videoType: "canvas",//视频类型，默认normal，video标签，可用canvas，枚举值normal，canvas
		controls: "controls",//是否展示原生控件，如果展示原生控件，则隐藏，H5的播放按钮，需视频类型是normal下生效，canvas下没有
 }}/>
 */
import './index.scss';
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import E from "../../utils/func";

const CmrCustVideo = forwardRef((props, ref) => {
	const {
		videoUrl = "",
		paddingSize = 15,
		className,
		initFlag = true,
		isFull = false,
		childrenPosition = "top",
		videoType = "canvas",
		controls = "controls",
	} = props.data;

	const [canvas, setCanvas] = useState();//获取canvas对象
	const [videoRef, setVideoRef] = useState();//获取视频video标签对象
	const [ctx, setCtx] = useState();//获取canvas画笔对象
	const [display, setDisplay] = useState(videoType === "normal");
	let playIconPos = {};
	let processPos = {};
	let timePos = {};
	const videoDomRef = useRef();
	const canvasRef = useRef();
	const canvasId = new Date().getTime() + "_" + (Math.floor(Math.random() * 10000) + 1);
	const videoId = canvasId + "_video";
	let aniFra = null;//设置频率帧对象
	let playIconDrawFlag = false;//是否已画过，默认是，一开始进来就有


	//页面渲染完成后开始操作
	useEffect(() => {
		if (initFlag) {
			initVideo();
		}
	}, []);
	//优先创建video对象一级获取canvas对象
	const getCtx = () => {
		if (canvasRef.current) {
			const pluginVideo = document.getElementById(videoId);
			if (pluginVideo) { pluginVideo.remove() };
			const videoDom = document.createElement("video");
			videoDom.src = videoUrl;
			videoDom.setAttribute("preload", "auto");
			videoDom.setAttribute("webkit-playsinline", "true");
			videoDom.setAttribute("playsinline", "playsinline");
			videoDom.setAttribute("x-webkit-airplay", "allow");
			videoDom.setAttribute("x5-video-player-type", "h5");
			if (!isFull) {//是否全屏播放，默认false默认窗口播放，true时，全屏播放
				videoDom.setAttribute("x5-video-player-fullscreen", "true");
			}
			const divDom = document.createElement("div");
			divDom.id = videoId;
			divDom.className = "videoFix";
			divDom.appendChild(videoDom);
			document.body.appendChild(divDom);
			setVideoRef(videoDom);
			setCanvas(canvasRef.current);
			setCtx(canvasRef.current.getContext("2d"));
		}
	}

	const getVideo = () => {
		videoDomRef.current.src = videoUrl;
		videoDomRef.current.setAttribute("preload", "auto");
		videoDomRef.current.setAttribute("webkit-playsinline", "true");
		videoDomRef.current.setAttribute("playsinline", "playsinline");
		videoDomRef.current.setAttribute("x-webkit-airplay", "allow");
		videoDomRef.current.setAttribute("x5-video-player-type", "h5");
		videoDomRef.current.setAttribute("controls", controls);
		if (!isFull) {//是否全屏播放，默认false默认窗口播放，true时，全屏播放
			videoDomRef.current.setAttribute("x5-video-player-fullscreen", "true");
		}
		addEventListenerVideo(videoDomRef.current);
	}

	//获取频宽比例，默认375下1:1
	const getScreenPix = (width) => {
		return width / 375;
	}

	//设置canvas对象
	useEffect(() => {
		if (canvas) {
			canvas.width = videoRef.offsetWidth * getPixelRatio();
			canvas.height = videoRef.offsetHeight * getPixelRatio();
			canvas.addEventListener("touchstart", (e) => {
				E.moveStop();
			});
			canvas.addEventListener("touchend", (e) => {
				const canvsRect = canvas.getBoundingClientRect();
				const canvasOffsetLeft = canvsRect.left;
				const canvasOffsetTop = canvsRect.top + getScrollTop();
				const isInPolygon = getInPolygon(playIconPos,
					{
						x: (playIconPos.x + playIconPos.width),
						y: (playIconPos.y + playIconPos.height),
					},
					{
						x: (e.changedTouches[0].pageX - canvasOffsetLeft) / getScreenPix(canvsRect.width) * getPixelRatio(),
						y: (e.changedTouches[0].pageY - canvasOffsetTop) / getScreenPix(canvsRect.width) * getPixelRatio(),
					}
				);
				isInPolygon && videoRef.paused && play();
				E.moveStart();
			});
		}
	}, [canvas]);
	//当获取到ctx画笔时，初始化视频对象并画到canvas上
	useEffect(() => {
		if (ctx) {
			addEventListenerVideo(videoRef);
			drawPoster();
		}
	}, [ctx]);

	//监听事件，需抛出事件给父组件，做二次处理，还需添加多种事件，将现有的22个事件全部添加进来
	const addEventListenerVideo = (video) => {
		video.addEventListener("abort", onabort, false);
		video.addEventListener("canplay", oncanplay, false);
		video.addEventListener("canplaythrough", oncanplaythrough, false);
		video.addEventListener("durationchange", ondurationchange, false);
		video.addEventListener("emptied", onemptied, false);
		video.addEventListener("ended", onended, false);
		video.addEventListener("error", onerror, false);
		video.addEventListener("loadeddata", onloadeddata, false);
		video.addEventListener("loadedmetadata", onloadedmetadata, false);
		video.addEventListener("loadstart", onloadstart, false);
		video.addEventListener("pause", onpause, false);
		video.addEventListener("play", onplay, false);
		video.addEventListener("playing", onplaying, false);
		video.addEventListener("progress", onprogress, false);
		video.addEventListener("ratechange", onratechange, false);
		video.addEventListener("seeked", onseeked, false);
		video.addEventListener("seeking", onseeking, false);
		video.addEventListener("stalled", onstalled, false);
		video.addEventListener("suspend", onsuspend, false);
		video.addEventListener("timeupdate", ontimeupdate, false);
		video.addEventListener("volumechange", onvolumechange, false);
		video.addEventListener("waiting", onwaiting, false);
	}

	//音视频方法-重新加载音频/视频元素
	const load = () => {
		if (videoType === "normal") {
			videoDomRef.current && videoDomRef.current.load();
		} else {
			videoRef && videoRef.load();
		}
	}
	//音视频方法-开始播放音频/视频
	const play = (e) => {
		e && e.preventDefault();
		if (videoType === "normal") {
			videoDomRef.current ? videoDomRef.current.play() : console.log('initFlag传的是：', initFlag, '需主动调用initVideo事件');
		} else {
			videoRef ? videoRef.play() : console.log('initFlag传的是：', initFlag, '需主动调用initVideo事件');
		}
	}
	//音视频暂停
	const pause = () => {
		if (videoType === "normal") {
			videoDomRef.current && videoDomRef.current.pause();
		} else {
			videoRef && videoRef.pause();
		}
	}
	//音视频初始化方法，暴露给外部组件使用
	const initVideo = () => {
		if (videoType === "normal") {
			getVideo();
		} else {
			getCtx();
		}
	}
	//将本组件自定义事件暴露给父组件的实例值
	useImperativeHandle(ref, () => ({
		load,
		play,
		pause,
		initVideo,
	}))

	//获取当前设备密度比，苹果一般是2倍或3倍
	const getPixelRatio = function () {
		return (window.devicePixelRatio || 1);
	}

	//获取滚动条滚动后的高度
	const getScrollTop = () => {
		return document.documentElement.scrollTop || document.body.scrollTop;
	}

	//获取点到点的距离
	const getDist = (pos1, pos2) => {
		const x = pos1.x - pos2.x;
		const y = pos1.y - pos2.y;
		return Math.sqrt(x ** 2 + y ** 2);
	}

	//获取是否在区域内，一般计算矩形规则,posStart左边边界点位, posEnd右边边界点位, point当前点击的点位
	const getInPolygon = (posStart, posEnd, point) => {
		return point.x >= posStart.x && point.x <= posEnd.x && point.y >= posStart.y && point.y <= posEnd.y;
	}

	//画播放按钮
	const drawPlayIcon = () => {
		if (playIconDrawFlag) { return };
		const playIconUrl = "//cdn.cmread.com/comment/image/5527c1c8a1d188c8056a750e9f194f05d5a71ee020eb/pic.jpg";
		const image = new Image();
		image.src = playIconUrl;
		image.crossOrigin = "anonymous";
		image.onload = () => {
			playIconPos = {
				x: canvas.width / 2 - (18 * getPixelRatio()),
				y: canvas.height / 2 - (18 * getPixelRatio()),
				width: 36 * getPixelRatio(),
				height: 36 * getPixelRatio(),
			};
			ctx.drawImage(image, 0, 0, image.width, image.height, playIconPos.x, playIconPos.y, playIconPos.width, playIconPos.height);
			playIconDrawFlag = true;
		}
		//加载失败时，展示dom元素的开始播放
		image.onerror = () => {
			console.log('播放按钮，加载失败');
		}
	}

	//画进度条
	const drawProcess = (timestamp) => {
		processPos = {
			x: 15 * getPixelRatio(),
			y: canvas.height - 12 * getPixelRatio(),
			r: 12,
			totalWidth: canvas.width - 30 * getPixelRatio(),
			moveDistance: (canvas.width - 30 * getPixelRatio()) / (videoRef.duration * 1000),
		}
		//画进度条底部常驻长条		
		ctx.beginPath();
		ctx.fillStyle = "#BEBEBE";
		ctx.arc(processPos.x, processPos.y + processPos.r / 2, processPos.r / 2, 0.5 * Math.PI, 1.5 * Math.PI, false);//画进度条圆头，看起来圆滑一些
		ctx.fill();
		ctx.arc(processPos.totalWidth + processPos.x, processPos.y + processPos.r / 2, processPos.r / 2, -0.5 * Math.PI, 0.5 * Math.PI, false);//画进度条圆尾，看起来圆滑一些
		ctx.fill();
		ctx.fillRect(processPos.x, processPos.y, processPos.totalWidth, processPos.r);//底部进度条
		ctx.closePath();
		//画当前位置的进度条圆点
		ctx.beginPath();
		ctx.fillStyle = "#fff";
		ctx.arc(processPos.x, processPos.y + processPos.r / 2, processPos.r / 2, 0.5 * Math.PI, 1.5 * Math.PI, false);//画进度条圆头，看起来圆滑一些
		ctx.fillRect(processPos.x, processPos.y, processPos.x + (videoRef.currentTime * 1000) * processPos.moveDistance - processPos.r * getPixelRatio(), processPos.r);//底部进度条,已经播放过的
		ctx.arc(processPos.x + (videoRef.currentTime * 1000) * processPos.moveDistance, processPos.y + processPos.r / 2, processPos.r, 0, 2 * Math.PI);//圆点		
		if (videoRef.currentTime >= videoRef.duration) {
			ctx.arc(processPos.totalWidth + processPos.x, processPos.y + processPos.r / 2, processPos.r / 2, -0.5 * Math.PI, 0.5 * Math.PI, false);//画进度条圆尾，看起来圆滑一些
		}
		ctx.fill();
		ctx.closePath();
	}

	//画时间
	const getTimeFormat = (time) => {//单位为秒传入
		const minute = Math.floor(time / 60);
		const second = time % 60;
		return (minute > 9 ? minute : "0" + minute) + ":" + (second > 9 ? second : "0" + second);
	}
	const drawTimeText = () => {
		timePos = {
			x: 15 * getPixelRatio(),
			y: canvas.height - 20 * getPixelRatio(),
			currTime: Math.floor(videoRef.currentTime),
			duration: Math.floor(videoRef.duration),
		}
		ctx.fillStyle = "#fff";
		ctx.font = `normal ${12 * getPixelRatio()}px sans-serif`;
		ctx.fillText(getTimeFormat(timePos.currTime), timePos.x, timePos.y);
		ctx.fillText("/", 50 * getPixelRatio(), timePos.y);
		ctx.fillText(getTimeFormat(timePos.duration), 60 * getPixelRatio(), timePos.y);
	}

	//画预览图，默认取视频第一帧的图
	const drawPoster = () => {
		ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
		drawPlayIcon();
	}

	//画视频，开始播放
	const drawPlay = (timestamp) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
		drawProcess();
		drawTimeText();
		aniFra = requestAnimationFrame(drawPlay);
	}

	//画最后暂停或停止的一帧，一般不会出现问题，页面不是激活状态时，会有问题
	const drawEndPlay = () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
	}
	//以下是事件监听
	//当音频/视频的加载已放弃时触发。
	const onabort = (...args) => {
		props.onabort && props.onabort(...args);
	}
	//当浏览器可以开始播放音频/视频时触发
	const oncanplay = (...args) => {
		props.oncanplay && props.oncanplay(...args);
	}
	//当浏览器可在不因缓冲而停顿的情况下进行播放时触发。
	const oncanplaythrough = (...args) => {
		props.oncanplaythrough && props.oncanplaythrough(...args);
	}
	//当音频/视频的时长已更改时触发
	const ondurationchange = (...args) => {
		props.ondurationchange && props.ondurationchange(...args);
	}
	//当目前的播放列表为空时触发
	const onemptied = (...args) => {
		props.onemptied && props.onemptied(...args);
	}
	//当目前的播放列表已结束时触发
	const onended = (...args) => {
		props.onended && props.onended(...args);
		if (videoType === "normal") {
			setDisplay(true);
		} else {
			drawEndPlay();
			drawPlayIcon();
			drawProcess();
			drawTimeText();
			cancelAnimationFrame(aniFra);
		}
	}
	//当在音频/视频加载期间发生错误时触发
	const onerror = (...args) => {
		props.onerror && props.onerror(...args);
	}
	//当浏览器已加载音频/视频的当前帧时触发
	const onloadeddata = (...args) => {
		props.onloadeddata && props.onloadeddata(...args);
	}
	//当浏览器已加载音频/视频的元数据时触发
	const onloadedmetadata = (...args) => {
		props.onloadedmetadata && props.onloadedmetadata(...args);
	}
	//当浏览器开始查找音频/视频时触发
	const onloadstart = (...args) => {
		props.onloadstart && props.onloadstart(...args);
	}
	//当音频/视频已暂停时触发
	const onpause = (...args) => {
		props.onpause && props.onpause(...args);
		if (videoType === "normal") {
			setDisplay(true);
		} else {
			drawEndPlay();
			drawPlayIcon();
			drawProcess();
			drawTimeText()
			cancelAnimationFrame(aniFra);
		}
	}
	//当音频/视频已开始或不再暂停时触发。
	const onplay = (...args) => {
		props.onplay && props.onplay(...args);
		if (videoType === "normal") {
			setDisplay(false);
		} else {
			playIconDrawFlag = false;
			drawPlay();
			drawProcess();
		}
	}
	//当音频/视频在因缓冲而暂停或停止后已就绪时触发
	const onplaying = (...args) => {
		props.onplaying && props.onplaying(...args);
	}
	//当浏览器正在下载音频/视频时触发
	const onprogress = (...args) => {
		props.onprogress && props.onprogress(...args);
	}
	//当音频/视频的播放速度已更改时触发
	const onratechange = (...args) => {
		props.onratechange && props.onratechange(...args);
	}
	//当用户已移动/跳跃到音频/视频中的新位置时触发
	const onseeked = (...args) => {
		props.onseeked && props.onseeked(...args);
	}
	//当用户开始移动/跳跃到音频/视频中的新位置时触发
	const onseeking = (...args) => {
		props.onseeking && props.onseeking(...args);
	}
	//当浏览器尝试获取媒体数据，但数据不可用时触发
	const onstalled = (...args) => {
		props.onstalled && props.onstalled(...args);
	}
	//当浏览器刻意不获取媒体数据时触发
	const onsuspend = (...args) => {
		props.onsuspend && props.onsuspend(...args);
	}
	//当目前的播放位置已更改时触发
	const ontimeupdate = (...args) => {
		props.ontimeupdate && props.ontimeupdate(...args);
	}
	//当音量已更改时触发
	const onvolumechange = (...args) => {
		props.onvolumechange && props.onvolumechange(...args);
	}
	//当视频由于需要缓冲下一帧而停止时触发
	const onwaiting = (...args) => {
		props.onwaiting && props.onwaiting(...args);
	}

	return (
		<div className={`CmrCustVideo ${className}`}>
			<div className='canvas-main' style={{ padding: paddingSize }}>
				{
					childrenPosition === "top" && props.children
				}
				{
					videoType === "normal" ?
						<video ref={videoDomRef}></video>
						:
						<canvas ref={canvasRef} id={canvasId} ></canvas>
				}
				{display && !controls && <div className="playIcon" onClick={play}></div>}
				{
					childrenPosition === "bottom" && props.children
				}
			</div>
		</div>
	)
})

export default CmrCustVideo;