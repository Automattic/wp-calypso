import { useEffect, useRef } from 'react';

type JQuery = () => object;
type Polldaddy = {
	display: () => void;
};
type WindowWithPolldaddyAndJQuery = {
	polldaddy: Polldaddy;
	jQuery: JQuery;
} & Window &
	typeof globalThis;

const POLL_ID = 14948860;

const createPollSettingsEl = ( pollId: number ): HTMLDivElement => {
	const sliderMountEl = document.createElement( 'div' );
	sliderMountEl.className = 'pd-embed';
	sliderMountEl.dataset.settings = JSON.stringify( {
		type: 'slider',
		embed: 'poll',
		delay: 100,
		visit: 'multiple',
		id: pollId,
	} );

	return sliderMountEl;
};

const CrowdsignalPollComponent = () => {
	const mountRef = useRef< HTMLDivElement >( null );

	const handleScriptLoad = () => {
		if ( ! mountRef.current ) {
			return;
		}

		const pollSettingsEl = createPollSettingsEl( POLL_ID );
		mountRef.current.appendChild( pollSettingsEl );

		// The polldaddy script depends on jQuery and will pull it itself and then call polldaddy.display() if it's not on the page.
		// I know... it's gross.
		if ( typeof ( window as WindowWithPolldaddyAndJQuery ).jQuery === 'undefined' ) {
			return;
		}

		// If jQuery is already on the page, we need to call polldaddy.display() ourselves.
		if ( typeof ( window as WindowWithPolldaddyAndJQuery ).polldaddy === 'undefined' ) {
			return;
		}

		( window as WindowWithPolldaddyAndJQuery ).polldaddy.display();
	};

	useEffect( () => {
		if ( ! mountRef.current ) {
			return;
		}

		const scriptEl = document.createElement( 'script' );
		scriptEl.setAttribute( 'src', 'https://app.crowdsignal.com/survey.js' );
		scriptEl.setAttribute( 'async', 'true' );
		scriptEl.setAttribute( 'charset', 'utf-8' );
		scriptEl.onload = handleScriptLoad;

		mountRef.current.appendChild( scriptEl );

		return () => {
			const sliderEl = document.getElementById( 'pd-embed-slider' ); // The polldaddy script adds a slider element to the end of the body, which won't get cleaned up by the component unmounting
			const sliderStyleEl = sliderEl?.nextElementSibling; // The polldaddy script also adds style tag after the slider element, which we need to clean up
			if ( sliderEl ) {
				sliderEl.remove();
			}
			if ( sliderStyleEl && sliderStyleEl.tagName === 'STYLE' ) {
				sliderStyleEl.remove();
			}
		};
	}, [] );

	return <div id="reader-crowdsignal-poll" ref={ mountRef }></div>;
};

export default CrowdsignalPollComponent;
