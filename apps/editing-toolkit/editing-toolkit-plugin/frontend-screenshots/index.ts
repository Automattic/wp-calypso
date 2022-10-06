export {};

const capture = async () => {
	const canvas = document.createElement( 'canvas' );
	canvas.width = window.innerWidth / 2;
	canvas.height = window.innerHeight / 2;
	const context = canvas.getContext( '2d' );
	const video = document.createElement( 'video' );

	const captureStream = await navigator.mediaDevices.getDisplayMedia();
	video.srcObject = captureStream;
	return new Promise( ( resolve ) => {
		video.addEventListener( 'loadedmetadata', () => {
			video.play();
			context?.drawImage( video, 0, 0, canvas.width, canvas.height );
			const frame = canvas.toDataURL( 'image/png' );
			setTimeout( () => {
				captureStream.getTracks().forEach( ( track ) => track.stop() );
				resolve( frame );
			}, 200 );
		} );
	} );
};

window.logDataUrl = async function () {
	try {
		const url = await capture();
		console.log( url );
	} catch ( e ) {
		console.log( e );
	}
};

window.addEventListener( 'message', async ( e ) => {
	switch ( e.data?.type ) {
		case 'CAPTURE_SCREEN':
			e.source?.postMessage( {
				type: 'RETURN_SCREEN',
				dataUrl: await capture(),
			} );
			break;
	}
} );
