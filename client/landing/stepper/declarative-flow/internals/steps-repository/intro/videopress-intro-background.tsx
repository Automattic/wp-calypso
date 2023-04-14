import { createRef, useEffect } from 'react';
import * as VideoPressIframeApi from './videopress-iframe-api';

const VideoPressIntroBackground = () => {
	const iframeRef = createRef< HTMLIFrameElement >();
	const divRef = createRef< HTMLDivElement >();
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	useEffect( () => {
		if ( prefersReducedMotion ) {
			return;
		}
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
	}, [ divRef, prefersReducedMotion ] );

	return (
		<>
			{ prefersReducedMotion ? null : (
				<iframe
					ref={ iframeRef }
					id="videopress-intro-video-frame"
					className="intro__video"
					title="Video"
					src="https://video.wordpress.com/v/l9GrBaPw?autoPlay=true&amp;controls=false&amp;muted=true&amp;loop=true&amp;cover=true&amp;playsinline=true"
				></iframe>
			) }
			<div ref={ divRef } className="intro__video loading-frame"></div>
		</>
	);
};

export default VideoPressIntroBackground;
