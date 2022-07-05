import { addQueryArgs } from '@wordpress/url';
import { DEFAULT_VIEWPORT_HEIGHT } from '../constants';
import type { Design, DesignPreviewOptions } from '../types';

export const getDesignPreviewUrl = (
	design: Design,
	options: DesignPreviewOptions = {}
): string => {
	const { recipe, slug } = design;

	//Anchor.fm themes get previews from their starter sites, ${slug}starter.wordpress.com
	if ( [ 'hannah', 'riley', 'gilbert' ].indexOf( slug ) >= 0 ) {
		return `https://${ slug }starter.wordpress.com`;
	}

	let url = addQueryArgs( 'https://public-api.wordpress.com/wpcom/v2/block-previews/site', {
		stylesheet: recipe?.stylesheet,
		pattern_ids: recipe?.pattern_ids?.join( ',' ),
		vertical_id: options.verticalId,
		language: options.language,
		...( options.viewport_width && { viewport_width: options.viewport_width } ),
		viewport_height: options.viewport_height || DEFAULT_VIEWPORT_HEIGHT,
		source_site: 'patternboilerplates.wordpress.com',
		use_screenshot_overrides: options.use_screenshot_overrides,
		colors: options.colors,
	} );

	const siteTitle = options.siteTitle || design.title;
	if ( siteTitle ) {
		// The preview url is sometimes used in a `background-image: url()` CSS rule and unescaped
		// parentheses in the URL break it. `addQueryArgs` and `encodeURIComponent` don't escape
		// parentheses so we've got to do it ourselves.
		url +=
			'&site_title=' +
			encodeURIComponent( siteTitle ).replace( /\(/g, '%28' ).replace( /\)/g, '%29' );
	}

	console.log( 'getDesignPreviewUrl', url );

	return url;
};
