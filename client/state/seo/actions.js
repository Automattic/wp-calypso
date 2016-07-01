import { SEO_TITLE_SET } from 'state/action-types';

export const setTitleFormat = ( pageType, format ) => ( {
	type: SEO_TITLE_SET,
	pageType,
	format
} );
