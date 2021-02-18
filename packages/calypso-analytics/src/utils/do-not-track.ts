/**
 * Internal dependencies
 */
import debug from './debug';

/**
 * Whether Do Not Track is enabled in the user's browser.
 *
 * @returns true if Do Not Track is enabled in the user's browser.
 */
export default function getDoNotTrack(): boolean {
	const result = Boolean(
		typeof window !== 'undefined' &&
			// Internet Explorer 11 uses window.doNotTrack rather than navigator.doNotTrack.
			// Safari 7.1.3+ uses window.doNotTrack rather than navigator.doNotTrack.
			// MDN ref: https://developer.mozilla.org/en-US/docs/Web/API/navigator/doNotTrack#Browser_compatibility
			( window.doNotTrack === '1' || ( window.navigator && window.navigator.doNotTrack === '1' ) )
	);
	debug( `Do Not Track: ${ result }` );
	return result;
}
