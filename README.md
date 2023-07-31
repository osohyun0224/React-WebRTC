# PWA-WebRTC


## 🫴🏻 Description 
 React를 사용하여 개발된 어플리케이션에서 웹RTC(Web Real-Time Communication)를 이용한 실시간 영상 및 음성 통신

## 📚 Development
![React.js](https://img.shields.io/badge/React.js-white?style=for-the-badge&logo=React&logoColor=black&color=61DAFB)
![Javascript](https://img.shields.io/badge/javascript-white?style=for-the-badge&logo=javascript&logoColor=black&color=F7DF1E)
![socket.io](https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=ffffff)
![firebase](https://img.shields.io/badge/firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=000000)

## 💡 주요 기능 안내

**(1) 녹화 시작 기능:** handleStartClick 함수는 사용자가 '녹화 시작' 버튼을 클릭하면 호출되어, 오디오와 비디오 스트림을 요청하고 로컬 비디오의 srcObject를 해당 스트림으로 설정하고 저장합니다. 스트림을 성공적으로 얻게 되면, 스트림을 저장하고 녹화를 시작합니다.

**(2) 의사(상대 서버)와 연결 기능:** handleCallClick 함수는 '의사와 연결' 버튼을 누르면 호출되며, 이 함수는 피어 연결을 초기화하고 로컬 스트림을 로컬 피어에 추가한 다음, 피어 연결에 대한 제안을 생성합니다. 이때 웹RTC 연결에서 사용되는 SDP (Session Description Protocol) 형식의 Offer를 생성하고, 생성된 Offer를 로컬 피어의 로컬 설명으로 설정하게 됩니다. 생성 과정에서 오류가 발생하면 에러를 처리합니다.

**(3) 연결 종료 기능:** handleStopClick 함수는 '연결 종료' 버튼을 누르면 호출되며, 피어 연결을 종료하고 로컬 스트림이 있는 경우에 해당 스트림을 종료합니다. 또한 녹화된 비디오를 mp4형식의 blob으로 다운로드 링크를 생성하고 폼 데이터에 추가합니다.

- 전체적으로 웹RTC, SDP, ICE candidate 등의 기술을 사용하고 Socket.IO를 이용한 서버 통신을 기능하고 있습니다.

  
