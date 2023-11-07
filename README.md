# basic-component-react
This is a basic component written in the React framework, function component+hooks。<br/>
Easy to copy into the project for later use。
<br/>
<h1>Plugin List</h1>
<h4>1.CmrCustVideo</h4>
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