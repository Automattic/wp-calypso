import { createRef, useEffect } from 'react';
import * as VideoPressIframeApi from './videopress-iframe-api';

const VideoPressIntroBackground = () => {
	const iframeRef = createRef< HTMLIFrameElement >();
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	useEffect( () => {
		if ( prefersReducedMotion ) {
			return;
		}

		const iframeApi = VideoPressIframeApi(
			document.getElementById( 'videopress-intro-video-frame' ),
			() => {
				const pollPlayer = () => {
					const divRef = document.getElementById( 'videopress-intro-loading-frame' );
					if ( null === divRef ) {
						setTimeout( pollPlayer, 100 );
						return;
					}

					if ( '0' === divRef.style.opacity ) {
						return;
					}

					iframeApi.status.player().then( ( status: string ) => {
						if ( 'playing' === status ) {
							iframeApi.controls.seek( 0 ).then( () => {
								divRef.style.opacity = '0';
							} );
						} else {
							setTimeout( pollPlayer, 100 );
						}
					} );
				};

				pollPlayer();
			}
		);
	}, [] );

	return (
		<>
			{ prefersReducedMotion ? null : (
				<iframe
					ref={ iframeRef }
					id="videopress-intro-video-frame"
					className="intro__video"
					title="Video"
					allow="autoplay; fullscreen"
					src="https://video.wordpress.com/v/l9GrBaPw?autoPlay=true&amp;controls=false&amp;muted=true&amp;loop=true&amp;cover=true&amp;playsinline=true"
				></iframe>
			) }
			<div id="videopress-intro-loading-frame" className="intro__video loading-frame"></div>
		</>
	);
};

export default VideoPressIntroBackground;
