import { addQueryArgs } from '@wordpress/url';

export function MShotsSitePreview( {
	url,
	width = 525,
	height = 350,
	virtual_width = 1200,
	virtual_height = 800,
}: {
	url: string;
	width?: number;
	height?: number;
	virtual_width?: number;
	virtual_height?: number;
} ) {
	const pageUrl = addQueryArgs( url, {
		hide_banners: true,
		preview: true,
		iframe: true,
	} );

	const src = addQueryArgs( `https://s0.wp.com/mshots/v1/${ encodeURIComponent( pageUrl ) }`, {
		vpw: virtual_width,
		vph: virtual_height,
		w: width,
		h: height,
	} );

	return <img loading="lazy" alt="Site Preview" src={ src } width={ width } height={ height } />;
}
