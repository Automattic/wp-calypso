import { addQueryArgs } from '@wordpress/url';
import { PATTERN_SOURCE_SITE_ID, PREVIEW_PATTERN_URL, SITE_TAGLINE } from './constants';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const getPatternPreviewUrl = ( {
	id,
	language,
	siteTitle,
	stylesheet,
}: {
	id: number;
	language: string;
	siteTitle?: string;
	stylesheet?: string;
} ) => {
	return addQueryArgs( PREVIEW_PATTERN_URL, {
		pattern_id: encodePatternId( id ),
		language,
		site_title: siteTitle,
		site_tagline: SITE_TAGLINE,
		stylesheet,
		remove_assets: true,
	} );
};
