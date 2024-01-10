import './App.scss';
import CmrCustVideo from './components/cmrCustVideo';
import Cmrpaint from './components/cmrpaint';
import { useRef } from "react";

export default function App() {
  const custVideoRef = useRef();
  const videoUrl = "/1.mp4";
  return (
    <div className="App">
      <CmrCustVideo data={{
        videoUrl,
        className: "my-video",
        paddingSize: 0,
        initFlag: true,
        childrenPosition: "top",
        videoType: "normal",
        controls: "controls",
      }} ref={custVideoRef}
        onplay={() => {
          console.warn("onplay start");
        }}
        onpause={() => {
          console.warn("onpause start");
        }}
        onended={() => {
          console.warn("onended start");
        }}
        waiting={(event) => {
          console.warn("waiting start", event);
        }}
      ><div className="cust-title">我是标题</div></CmrCustVideo>
      <CmrCustVideo data={{
        videoUrl,
        className: "my-video",
        paddingSize: 0,
        initFlag: true,
        childrenPosition: "top",
        videoType: "canvas",
        controls: "",
      }} ref={custVideoRef}
        onplay={() => {
          console.warn("onplay start");
        }}
        onpause={() => {
          console.warn("onpause start");
        }}
        onended={() => {
          console.warn("onended start");
        }}
        waiting={(event) => {
          console.warn("waiting start", event);
        }}
      ><div className="cust-title">我是标题</div></CmrCustVideo>
      <Cmrpaint options={{}} className="mypaint" width={375} height={200} pix={2} />
    </div>
  );
}