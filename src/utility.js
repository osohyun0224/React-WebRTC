function saveStream(stream) {
    const options = {mimeType: 'video/webm'};
    window.recordedChunks = [];
    window.mediaRecorder = new MediaRecorder(stream, options);
  
    window.mediaRecorder.addEventListener('dataavailable', function(e) {
      if (e.data.size > 0) {
        window.recordedChunks.push(e.data);
      }
    });
  
    window.mediaRecorder.addEventListener('stop', function() {
      const blob = new Blob(window.recordedChunks, {
        type: 'video/webm'
      });
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = '녹화영상.webm';
      document.body.appendChild(a);
      a.click();
  
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    });
  }
  
  export {saveStream};