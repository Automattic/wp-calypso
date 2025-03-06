import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { tagsListing, fetchTrendingTags, fetchAlphabeticTags } from './controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		[ '/tags', `/${ langParam }/tags` ],
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		updateLastRoute,
		fetchTrendingTags,
		fetchAlphabeticTags,
		sidebar,
		tagsListing,
		makeLayout,
		clientRender
	);
}
