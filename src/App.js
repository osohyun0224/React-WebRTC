import React, { Component } from 'react';
import './App.css';
import {saveStream} from './utility';
import {io} from "socket.io-client";

class App extends Component {
  localPeer;
  remotePeer;

  constructor() {
    super();
    this.state = {isStartDisabled: false, isCallDisabled: true, isHangUpDisabled: true, localStream: undefined};
  }

  componentDidMount() {
    this.socket = io("http://localhost:3000");
    this.socket.on("offer", this.handleOffer);
    this.socket.on("answer", this.handleAnswer);
    this.socket.on("candidate", this.handleCandidate);
  }
  /* 아래부터는 핸들러이다. 핸들러들은 Socket.IO를 통해 오는 메시지를 처리하고, 웹RTC 피어 연결을 설정하고 유지하기 위해 필요한 작업을 수행한다. 
  이는 웹RTC 연결 설정의 기본적인 부분으로, SDP와 ICE 후보 정보를 교환하여 두 피어가 서로 통신할 수 있도록 하기에 꼭 필요한 핸들러 들만 구현했다. */

  /* offer 이벤트가 서버로부터 클라이언트에 도착할 때 호출된다. offer는 원격 피어에 의해 생성되고나서 이 offer를 통해 로칼 피어는
  원격 피어와 통신하기 위해 응답을 생성하는 기능을 한다. 
  정리해보면 원격 치어의 SDP를 설정하고나서 해당 응답을 생성하기 위해 createAnswer 메소드를 호출한다. 
  문제생기면 오류를 처리하도록 함수를 지정해두었다.*/ 
  handleOffer = (offer) => {
    this.remotePeer.setRemoteDescription(offer);
    this.remotePeer.createAnswer()
      .then(this.createdAnswer)
      .catch(this.setSessionDescriptionError);
  }
  /* answer 이벤트가 서버로부터 클라이언트에 도착할 때 호출된다. 이 이벤트는 원격의 피어가 offer 메세지에 메세지에 응답했음을 알 수 있고 로컬 피어의 sdp를 설정하는데 사용된다. */
  handleAnswer = (answer) => {
    this.localPeer.setRemoteDescription(answer);
  }
  /* candidate 이벤트가 서버로부터 클라이언트에 도착할때 호출된다. ice 후보자는 네트워크를 통해 두 피어간의 데이터를 전송하는 방법을 나타낸다. 이 이벤트는 새로운 ice 후보가 생성된걸 알려주고 이 후보를 원격 피어에 추가한다. */
  handleCandidate = (candidate) => {
    const iceCandidate = new RTCIceCandidate(candidate);
    this.remotePeer.addIceCandidate(iceCandidate);
  }
  
  // 로컬 피어와 원격 피어의 피어 연결을 초기화한다. 각 피어에 'icecandidate' 이벤트 리스너를 추가하며, 이는 인터넷 연결성을 협상하는 데 사용된다. 원격 피어에 스트림이 추가되면 원격 비디오의 srcObject를 해당 스트림으로 설정한다.
  initPeerConnection = () =>{
    this.localPeer = new RTCPeerConnection(null);
    this.localPeer.addEventListener('icecandidate', this.handleConnection);
    this.remotePeer = new RTCPeerConnection(null);
    this.remotePeer.addEventListener('icecandidate', this.handleConnection);
    this.remotePeer.onaddstream = (e) => this.remoteVideo.srcObject = e.stream;
  }
// 'icecandidate' 이벤트가 발생할 때 호출되고, 새로운 ICE 후보를 다른 피어에 추가하는 기능을 한다.
  handleConnection = (event) => {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;
  
    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate);
      const otherPeer = this.getOtherPeer(peerConnection);
  
      otherPeer.addIceCandidate(newIceCandidate)
        .then(() => {
          // success
        }).catch((error) => {
          // failure
        });
    }
  }
// 사용자가 '녹화 시작' 버튼을 클릭할 때 호출되며, 오디오와 비디오 스트림을 요청하고, 성공적으로 스트림을 가져오면 로컬 비디오의 srcObject를 해당 스트림으로 설정하고 저장한다.
  handleStartClick = () => {
    this.setState({isStartDisabled: true});
    this.setState({isCallDisabled: false});
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    .then((stream) => {
      this.setState({localStream: stream});
      this.localVideo.srcObject = this.state.localStream;
    
      // Start recording after getting the media stream
      saveStream(stream);
      window.mediaRecorder.start();
    })
    .catch(function(e) {
      alert('getUserMedia() error: ' + e.name);
    });
  }

  handleSuccess = (stream) => {
    // when user is offline, recording the stream
    if (!window.navigator.onLine)
      saveStream(stream);

    this.setState({localStream: stream});
    this.localVideo.srcObject = this.state.localStream;
  }
// 사용자가 의사와의 연결을 눌렀을 때 호출되며 피어 연결을 초기화하고 로컬 스트림을 로컬 피어에 추가한 다음 피어 연결에 대한 제안을 생성하는 기능을 한다.
  handleCallClick = () => {
    this.setState({isCallDisabled: true});
    this.setState({isHangUpDisabled: false});

    this.initPeerConnection();
    this.localPeer.addStream(this.state.localStream);

    const offerOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    };

    this.localPeer.createOffer(offerOptions)
    .then(this.createdOffer).catch(this.setSessionDescriptionError);
  }
// 제안이 성공적으로 호출 된 경우에 호출되며, 로컬 피어와 원격피어의 세션 설명을 설정하고 원격 피어에 대한 응답을 생성한다.
  createdOffer = (description) => {
    this.localPeer.setLocalDescription(description);
    this.remotePeer.setRemoteDescription(description);

    this.remotePeer.createAnswer()
      .then(this.createdAnswer)
      .catch(this.setSessionDescriptionError);
  }
// 원격피어가 응답을 성공적으로 생성한 후에 호출된다. 원격 피어와 로컬 피어의 세션 설명을 설정한다.
  createdAnswer = (description) => {
    this.remotePeer.setLocalDescription(description);
    this.localPeer.setRemoteDescription(description);
  }

  setSessionDescriptionError(error) {
    console.log(error.toString());
  }

  getOtherPeer(pc) {
    return (pc === this.localPeer) ? this.remotePeer : this.localPeer;
  }
// 사용자가 연결 종료를 눌렀을 때 호출되며 피어 연결을 종료하고 로컬 스트림이 있는 경우에 해당 스트림을 종료한다. 또한 녹화된 비디오를 mp4형식의 **blob**으로 다운로드 링크를 생성하고 폼 데이터에 추가해줌
  handleStopClick = () => {
    this.localPeer.close();
    this.remotePeer.close();
    this.localPeer = undefined;
    this.remotePeer = undefined;
  
    // 웹캠 꺼지는 거 구현 나중에 안하고 싶으면 이 코드 지우면 됨
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => track.stop());
      this.setState({localStream: undefined});
    }
  
    this.setState({isStartDisabled: false});
    this.setState({isCallDisabled: true});
    this.setState({isHangUpDisabled: true});
  
  // 바이너리 형식으로 백엔드에게 보내주기 위해
  if (window.mediaRecorder) {
    window.mediaRecorder.addEventListener('dataavailable', event => {
      const videoBlob = new Blob([event.data], { type: 'video/mp4' });
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(videoBlob);
      downloadLink.download = 'recordedVideo.mp4';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
    
      const formData = new FormData();
      formData.append('file', videoBlob, 'recordedVideo.mp4');

      // 백엔드 연결 테스트 해볼때 확인 가능
      /*
      fetch('백엔드 url (여기서는 firebase 이지만 ,,, 통신개념이 아니라 무의미함. ', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
      */
    });

    window.mediaRecorder.stop();
  }
}

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1 className="App-title"> 간단하게 webrtc </h1>
        </header>
        {/* <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p> */}
        <div className="App-videos">
          <video id="localVideo" autoPlay playsInline ref={video => {this.localVideo = video}}></video>
          <video id="remoteVideo" autoPlay playsInline ref={video => {this.remoteVideo = video}}></video>
        </div>

        <div className="App-action-btns">
          <button id="startButton" className="actionButton" onClick={this.handleStartClick} disabled={this.state.isStartDisabled}>녹화 시작</button>
          <button id="callButton" className="actionButton" onClick={this.handleCallClick} disabled={this.state.isCallDisabled}>의사와 연결</button>
          <button id="hangupButton" className="actionButton" onClick={this.handleStopClick} disabled={this.state.isHangUpDisabled}>연결 종료</button>
        </div>
      </div>
    );
  }
}

export default App;