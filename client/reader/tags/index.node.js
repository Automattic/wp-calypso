import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { tagsListing, fetchTrendingTags, fetchAlphabeticTags } from './controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();

	router(
		[ '/tags', `/${ langParam }/tags`, `/${ anyLangParam }/tags` ],
		ssrSetupLocale,
		fetchTrendingTags,
		fetchAlphabeticTags,
		tagsListing,
		makeLayout
	);
}
