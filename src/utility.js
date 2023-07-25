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
        // save to indexedDb
        if ('indexedDB' in window && window.dbAccess){
            window.dbAccess.writeData('stream', {id: 'tmpRecord', stream: new Blob(window.recordedChunks)})
            .then(() => {
                // trigger sw's sync event
                if('serviceWorker' in navigator && 'SyncManager' in window){
                    navigator.serviceWorker.ready.then(function(swRegistration) {
                        swRegistration.sync.register('save-stream');
                    });
                }
            });
        }
    });
  }
  
  export {saveStream};
  