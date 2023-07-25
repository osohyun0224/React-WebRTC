import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {saveStream} from './utility';

class App extends Component {
  localPeer;
  remotePeer;

  constructor() {
    super();
    this.state = {isStartDisabled: false, isCallDisabled: true, isHangUpDisabled: true, localStream: undefined};
  }

  componentDidMount() {
   
  }

  initPeerConnection = () =>{
    this.localPeer = new RTCPeerConnection(null);
    this.localPeer.addEventListener('icecandidate', this.handleConnection);
    this.remotePeer = new RTCPeerConnection(null);
    this.remotePeer.addEventListener('icecandidate', this.handleConnection);
    this.remotePeer.onaddstream = (e) => this.remoteVideo.srcObject = e.stream;
  }

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

  handleStartClick = () => {
    this.setState({isStartDisabled: true});
    this.setState({isCallDisabled: false});
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    .then((stream) => {
      // when user is offline, recording the stream
      if (!window.navigator.onLine)
        saveStream(stream);
  
      this.setState({localStream: stream});
      this.localVideo.srcObject = this.state.localStream;
  
      // Start recording after getting the media stream
      window.mediaRecorder.start(1000);
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

  createdOffer = (description) => {
    this.localPeer.setLocalDescription(description);
    this.remotePeer.setRemoteDescription(description);

    this.remotePeer.createAnswer()
      .then(this.createdAnswer)
      .catch(this.setSessionDescriptionError);
  }

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

  handleStopClick = () => {
    this.localPeer.close();
    this.remotePeer.close();
    this.localPeer = undefined;
    this.remotePeer = undefined;
  
    this.setState({localStream: undefined});
    this.setState({isStartDisabled: false});
    this.setState({isCallDisabled: true});
    this.setState({isHangUpDisabled: true});
   
    // 웹캠 꺼지는 거 구현 나중에 안하고 싶으면 이 코드 지우면 됨
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => track.stop());
    }
    // Stop recording and then download the recorded video.
    window.mediaRecorder.stop();
  
    const blob = new Blob(window.recordedChunks, {
      type: 'video/webm'
    });
  
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
  
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
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