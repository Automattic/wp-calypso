import { SEO_TITLE_SET } from 'state/action-types';

export const setTitleFormat = ( siteId, pageType, format ) => ( {
	type: SEO_TITLE_SET,
	siteId,
	pageType,
	format
} );
