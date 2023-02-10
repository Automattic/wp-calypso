import { addQueryArgs } from '@wordpress/url';
import { DEFAULT_VIEWPORT_HEIGHT } from '../constants';
import type { Design, DesignPreviewOptions } from '../types';

function encodeParenthesesInText( text: string ) {
	return encodeURIComponent( text ).replace( /\(/g, '%28' ).replace( /\)/g, '%29' );
}

export const getDesignPreviewUrl = (
	design: Design,
	options: DesignPreviewOptions = {}
): string => {
	const { recipe, slug, is_virtual, style_variation } = design;

	//Anchor.fm themes get previews from their starter sites, ${slug}starter.wordpress.com
	if ( [ 'hannah', 'riley', 'gilbert' ].indexOf( slug ) >= 0 ) {
		return `https://${ slug }starter.wordpress.com`;
	}

	let url = addQueryArgs( 'https://public-api.wordpress.com/wpcom/v2/block-previews/site', {
		stylesheet: recipe?.stylesheet,
		pattern_ids: recipe?.pattern_ids?.join( ',' ),
		header_pattern_ids: recipe?.header_pattern_ids
			? recipe?.header_pattern_ids.join( ',' )
			: undefined,
		footer_pattern_ids: recipe?.footer_pattern_ids
			? recipe?.footer_pattern_ids.join( ',' )
			: undefined,
		vertical_id: options.vertical_id,
		language: options.language,
		...( options.viewport_width && { viewport_width: options.viewport_width } ),
		viewport_height: ! options.disable_viewport_height
			? options.viewport_height || DEFAULT_VIEWPORT_HEIGHT
			: undefined,
		source_site: 'patternboilerplates.wordpress.com',
		use_screenshot_overrides: options.use_screenshot_overrides,
		remove_assets: options.remove_assets,
		...( is_virtual && style_variation && { style_variation: style_variation.title } ),
	} );

	// The preview url is sometimes used in a `background-image: url()` CSS rule and unescaped
	// parentheses in the URL break it. `addQueryArgs` and `encodeURIComponent` don't escape
	// parentheses so we've got to do it ourselves.
	const siteTitle = options.site_title || design.title;
	if ( siteTitle ) {
		url += `&site_title=${ encodeParenthesesInText( siteTitle ) }`;
	}

	if ( options.site_tagline ) {
		url += `&site_tagline=${ encodeParenthesesInText( options.site_tagline ) }`;
	}

	return url;
};
