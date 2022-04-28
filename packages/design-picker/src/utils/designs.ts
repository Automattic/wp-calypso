import { addQueryArgs } from '@wordpress/url';
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
		pattern_ids: recipe?.patternIds?.join( ',' ),
		language: options.language,
		viewport_height: 700,
		source_site: 'patternboilerplates.wordpress.com',
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

	return url;
};
