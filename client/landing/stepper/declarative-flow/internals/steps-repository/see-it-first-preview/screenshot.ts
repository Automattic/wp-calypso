import { addQueryArgs } from '@wordpress/url';

/**
 * A tall capture of the site at tablet width: about as wide as half a desktop screen, and as long
 * as mShots captures (3072px), so the preview scrolls through the page.
 */
export const LONG_SCREENSHOT = {
	vpw: 767,
	vph: 1600,
	w: 767,
	h: 3072,
	screen_height: 3072,
};

/**
 * Ask mShots to capture the long screenshot. It generates an unfamiliar size only when asked to
 * requeue, which takes a few seconds and shows a placeholder meanwhile, so ask once, before the
 * preview needs it. Images aren't bound by CORS, so this works from any origin.
 * @param url The site to capture.
 */
export function requestLongScreenshot( url: string ) {
	if ( ! url ) {
		return;
	}
	const image = new Image();
	image.src = addQueryArgs( `https://s0.wp.com/mshots/v1/${ encodeURIComponent( url ) }`, {
		...LONG_SCREENSHOT,
		requeue: true,
	} );
}
