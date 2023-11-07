import './App.css';
import CmrCustVideo from './components/cmrCustVideo';
import { useRef } from "react";

const videoUrl = "//mgcdn.migucloud.com/vi0/ftp/miguread/CLOUD1000194111/54/1ctd0I2B38ILDsGD0qeEMP4sim54.mp4?duration=54&owner=198&quality=54&timestamp=20170915102011&title=yuanzun_sc54.mp4&vid=1ctd0I2B38ILDsGD0qeE&para1=yyy&para2=xxx"
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