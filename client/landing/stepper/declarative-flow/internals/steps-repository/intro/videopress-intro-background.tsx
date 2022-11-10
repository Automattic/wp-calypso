import { createRef, useEffect } from 'react';
import * as VideoPressIframeApi from './videopress-iframe-api';

const VideoPressIntroBackground = () => {
	const iframeRef = createRef< HTMLIFrameElement >();
	const divRef = createRef< HTMLDivElement >();

	useEffect( () => {
		const iframeApi = VideoPressIframeApi(
			document.getElementById( 'videopress-intro-video-frame' ),
			() => {
				const callbackId = iframeApi.status.onPlayerStatusChanged(
					( oldStatus: string, newStatus: string ) => {
						if ( 'playing' === newStatus ) {
							iframeApi.controls.seek( 0 ).then( () => {
								if ( divRef.current ) {
									divRef.current.style.display = 'none';
								}
								iframeApi.status.offPlayerStatusChanged( callbackId );
							} );
						}
					}
				);
			}
		);
	}, [ divRef ] );

	return (
		<>
			<iframe
				ref={ iframeRef }
				id="videopress-intro-video-frame"
				className="intro__video"
				title="Video"
				src="https://video.wordpress.com/v/l9GrBaPw?autoPlay=true&amp;controls=false&amp;muted=true&amp;loop=true&amp;cover=true&amp;playsinline=true"
			></iframe>
			<div ref={ divRef } className="intro__video loading-frame"></div>
		</>
	);
};

export default VideoPressIntroBackground;
