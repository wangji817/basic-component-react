/**
 * CmrTailwindcss
 * @author wj
 * @description 引入自定义样式类表，减少样式开发
 * @property {object} data 
 * @example <CmrTailwindcss data={object}/>
 */
import './index.scss';
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
export default function CmrTailwindcss(props = {}) {
	//自定义类名列表,语法按这个写
	const custStyles = {
		top: 't-top-',
		left: 't-left-',
		right: 't-right-',
		bottom: 't-bottom-',
		zIndex: 't-z-',
		p: 't-p-',
		pl: 't-pl-',
		pr: 't-pr-',
		pt: 't-pt-',
		pb: 't-pb-',
		w: 't-w-',
		minW: 't-min-w-',
		h: 't-h-',
		minH: 't-min-h-',
		textSize: 't-text-',
		lineHeight: 't-leading-',
		textColor: 't-text-color-',
		indent: 't-indent-',
		bg: 't-bg-',
		bgImg: 't-bg-img-',
		zIndex: 't-z-',
		opacity: 't-opacity-',
		border: 't-border-',
		borderW: 't-border-w-',
		borderColor: 't-border-color-',
		borderR: 't-rounded-',
		borderRT: 't-rounded-t-',
		borderRB: 't-rounded-b-',
		borderRL: 't-rounded-l-',
		borderRR: 't-rounded-r-',
	}
	//自定义类名实际css属性名
	const custStylesName = {
		't-top-': 'top',
		't-left-': 'left',
		't-right-': 'right',
		't-bottom-': 'bottom',
		't-p-': 'padding',
		't-pl-': 'padding-left',
		't-pr-': 'padding-right',
		't-pt-': 'padding-top',
		't-pb-': 'padding-bottom',
		't-w-': 'width',
		't-min-w-': 'min-width',
		't-h-': 'height',
		't-min-h-': 'min-height',
		't-text-': 'font-size',
		't-leading-': 'line-height',
		't-text-color-': 'color',
		't-indent-': 'text-indent',
		't-bg-': 'background',
		't-bg-img-': 'background-image',
		't-z-': 'z-index',
		't-opacity-': 'opacity',
		't-border-w-': 'border-width',
		't-border-color-': 'border-color',
		't-rounded-': 'border-radius',
		't-rounded-t-': ['border-top-left-radius', 'border-top-right-radius'],
		't-rounded-b-': ['border-bottom-left-radius', 'border-bottom-right-radius'],
		't-rounded-l-': ['border-top-left-radius', 'border-bottom-left-radius'],
		't-rounded-r-': ['border-top-right-radius', 'border-bottom-right-radius'],
	}
	const regSuffix = `[(\\[^[\\]+)]`;
	const cssValueReg = /\[([^\]]+)\]/g;
	const {
		pxToRem = 15,//px转成rem比例，默认15px:1rem
	} = props;

	//反斜杆转移字符
	const escapeSpecialCharacters = (str) => {
		// 正则表达式，匹配 [、] 和 #
		let regex = /[\[\]#\(\).,:\/\-"']/g;

		// 使用 replace 方法来替换匹配到的字符
		// 这里我们用反斜杠来转义它们，但你也可以选择其他替换方式
		let escapedStr = str.replace(regex, (match) => {
			// eslint-disable-next-line default-case
			switch (match) {
				case '[':
					return '\[';
				case ']':
					return '\]';
				case '#':
					return '\\#';
				case '(':
					return '\\(';
				case ')':
					return '\\)';
				case '.':
					return '\\.';
				case ',':
					return '\\2c ';
				case '-':
					return '\-';
				case '/':
					return '\\/';
				case ':':
					return '\\:';
				case '"':
					return '\\"';
				case "'":
					return "\\'";
			}
		});

		return escapedStr;
	}

	//px自动转rem
	const pxToRemFn = (str) => {
		let regex = /(\d+)(px)/;
		return str.replace(regex, (match, number, unit) => {
			// 提取数字并生成新的字符串
			let newString = (number / pxToRem) + 'rem';
			return newString;
		})
	}

	//转化css代码
	const toCss = (classNameList = []) => {
		classNameList.map(className => {
			const prefixe = className.replace(/\[[^\]]+\]/g, '');
			const matches = className.match(cssValueReg);
			// 提取并处理匹配项中的值（去掉方括号）
			let cssVal = matches ? matches.map(match => match.slice(1, -1))[0] : '';
			const newClassName = custStylesName[prefixe];
			const escapedClassName = escapeSpecialCharacters(className).replace(/(\[|\])/g, '\\$1');
			if (cssVal.includes('px')) {
				cssVal = pxToRemFn(cssVal);
			}
			let cssText = '';
			if (Array.isArray(newClassName)) {//如果是数组，则是圆角类型，要单独处理遍历				
				cssText = `
					.${escapedClassName} {
						${newClassName[0]}: ${cssVal};
						${newClassName[1]}: ${cssVal}
					}
				`
			} else {
				cssText = `
					.${escapedClassName} {
						${newClassName}: ${cssVal}
					}
				`
			}
			appendCss(cssText)
		})
	}

	//添加css代码到head中
	const appendCss = (cssText = '') => {
		if (!cssText) return;
		// 创建一个新的<style>元素
		const styleElement = document.createElement('style');
		styleElement.type = 'text/css';
		// 将CSS文本添加到<style>元素的内部
		if (styleElement.styleSheet) {
			// 对于IE浏览器
			styleElement.styleSheet.cssText = cssText;
		} else {
			// 其他浏览器
			styleElement.appendChild(document.createTextNode(cssText));
		}
		styleElement.innerHTML = cssText;
		// 将<style>元素添加到<head>中
		document.head.appendChild(styleElement);
	}

	//获取全局有自定义class的元素列表
	const getElements = () => {
		Object.keys(custStyles).forEach(key => {
			const substring = custStyles[key];
			const elements = document.querySelectorAll(`[class*= "${substring}"]`);
			elements && elements.length && checkElement(elements, substring)
		});
	}

	//检查全局dom，是否有自定义css
	const checkElement = (elements, substring) => {
		// console.log(elements, substring)
		elements.forEach(element => {
			const allClasses = [...element.classList];
			if (allClasses && allClasses.length) {
				const regexString = `${substring}${regSuffix}`;
				const regExp = new RegExp(regexString);
				const custCssList = allClasses.filter(className => regExp.test(className));
				custCssList && custCssList.length && toCss(custCssList)
			}
		});
	}

	useEffect(() => {
		try {
			getElements()
		} catch (error) {
			console.log(error)
		}
	}, []);

	return <div className="CmrTailwindcss">{props.children}</div>
}