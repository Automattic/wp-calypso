export interface MShotConfig {
	vpw: number;
	vph: number;
	w: number;
	h: number;
	screen_height: number;
	scale: number;
}

// The site checks only show sites at desktop size, so that's the only capture made.
export const SITE_PREVIEW_MSHOT: MShotConfig = {
	vpw: 1440,
	vph: 1440,
	w: 1440,
	h: 1462,
	screen_height: 1440,
	scale: 2,
};

const getSitePreviewMShotUrl = ( url: string ) =>
	`https://s0.wp.com/mshots/v1/${ encodeURIComponent( url ) }?${ Object.entries(
		SITE_PREVIEW_MSHOT
	)
		.map( ( [ key, value ] ) => `${ key }=${ value }` )
		.join( '&' ) }`;

/**
 * Starts generating a site's preview ahead of showing it, since mShots can take a while.
 */
export const createSitePreviewScreenshot = ( url: string ) => {
	const request = new XMLHttpRequest();
	request.open( 'GET', getSitePreviewMShotUrl( url ) );
	request.send();
};
