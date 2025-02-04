export default function initSentry() {
	const script = document.createElement( 'script' );
	// Uses unique DNS specific to Odyssey Stats.
	script.src = 'https://js.sentry-cdn.com/332d216a4d31158057fb5277cd48f438.min.js';
	script.crossOrigin = 'anonymous';
	document.body.appendChild( script );
}
