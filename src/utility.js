// 전체저긍로 주어진 미디어스트림을 녹화하고 녹화된 데이터를 웹 페이지에 다운로드 링크로 제공한다.
function saveStream(stream) {
    const options = {mimeType: 'video/webm'};
    window.recordedChunks = [];
    window.mediaRecorder = new MediaRecorder(stream, options);
  
    window.mediaRecorder.addEventListener('dataavailable', function(e) {
    // 'dataavailable' 이벤트는 녹화된 미디어 데이터가 사용 가능해질 때 발생한다.
    // 데이터 크기가 0보다 큰 경우, 데이터를 recordedChunks 배열에 추가한다.
      if (e.data.size > 0) {
        window.recordedChunks.push(e.data);
      }
    });
  
    window.mediaRecorder.addEventListener('stop', function() {
      // 'stop' 이벤트는 녹화가 종료될 때 발생한다.
      // recordedChunks 배열의 모든 데이터를 이용해 Blob 객체를 생성한다. 
      // 이 Blob 객체는 video/webm 형식의 녹화된 미디어 데이터를 나타낸다.
      const blob = new Blob(window.recordedChunks, {
        type: 'video/webm'
      });
      // Blob 객체를 가리키는 URL을 생성한다.
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = '녹화영상.webm';
      document.body.appendChild(a);
      a.click();
  
      setTimeout(() => {
        // a 태그를 제거하고, Blob 객체를 가리키는 URL을 해제한다.
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    });
  }
  
  export {saveStream};