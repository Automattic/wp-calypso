import { createRef, useEffect } from 'react';
import * as VideoPressIframeApi from './videopress-iframe-api';

const VideoPressIntroBackground = () => {
	const iframeRef = createRef< HTMLIFrameElement >();
	const divRef = createRef< HTMLDivElement >();
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	useEffect( () => {
		if ( ! divRef.current || prefersReducedMotion ) {
			return;
		}

		const iframeApi = VideoPressIframeApi(
			document.getElementById( 'videopress-intro-video-frame' ),
			() => {
				const pollPlayer = () => {
					if ( '0' === divRef.current?.style.opacity ) {
						return;
					}

					iframeApi.status.player().then( ( status: string ) => {
						if ( 'playing' === status ) {
							iframeApi.controls.seek( 0 ).then( () => {
								if ( divRef.current ) {
									divRef.current.style.opacity = '0';
								}
							} );
						} else {
							setTimeout( pollPlayer, 100 );
						}
					} );
				};

				pollPlayer();
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
