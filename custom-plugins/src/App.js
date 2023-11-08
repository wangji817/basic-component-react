import './App.scss';
import CmrCustVideo from './components/cmrCustVideo';
import { useRef } from "react";

const videoUrl = "/1.mp4";
export default function App() {
  const custVideoRef = useRef();
  return (
    <div className="App">
      <CmrCustVideo data={{
        videoUrl,
        className: "my-video",
        paddingSize: 10,
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
    </div>
  );
}