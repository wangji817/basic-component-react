# basic-component-react
This is a basic component written in the React framework, function component+hooks。<br/>
Easy to copy into the project for later use。
<br/>
<h1>Plugin List</h1>
<h4>CmrCustVideo</h4>
<h6>视频组件，可自定义设置video还是canvas渲染，可复写自定义播放器</h6>

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

<h4>Cmrpaint</h4>
<h6>canvas毛笔组件，可兼容pc和移动端，毛笔写字</h6>

	<Cmrpaint options={{}} className="mypaint" width={375} height={200} pix={2} />

<h4>CmrTailwindcss</h4>
<h6>自定义css组件，可兼容pc和移动端，可添加修改</h6>

	<CmrTailwindcss pxToRem={15-'自适应比例，默认1rem=15px'}>
		<div>创建子children，或不写</div>
	</CmrTailwindcss>	
	