import { useCallback } from 'react';

function useScreenshot( setScreenShot: ( screenShot: string ) => void ) {
	const createScreenShot = useCallback( async (): Promise< string > => {
		const mediaStream = await navigator.mediaDevices.getDisplayMedia( {
			video: true,
			preferCurrentTab: true,
		} as unknown as DisplayMediaStreamOptions );

		const video = document.createElement( 'video' );
		video.srcObject = mediaStream;
		await video.play();

		// Wait for video to be ready (loadeddata event might be more appropriate in some cases)
		await new Promise( ( r ) => setTimeout( r, 2000 ) );

		const canvas = document.createElement( 'canvas' );
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const ctx = canvas.getContext( '2d' );
		ctx?.drawImage( video, 0, 0 );

		const data = canvas.toDataURL( 'image/jpeg' );
		setScreenShot( data );

		// Stop all tracks to release the media devices
		mediaStream.getTracks().forEach( ( track ) => track.stop() );

		return data;
	}, [ setScreenShot ] );

	return { createScreenShot };
}

export default useScreenshot;
