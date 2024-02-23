import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { sidebar } from '../controller';
import { tagsListing, fetchTrendingTags, fetchAlphabeticTags } from './controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		[ '/tags', `/${ langParam }/tags` ],
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		fetchTrendingTags,
		fetchAlphabeticTags,
		sidebar,
		tagsListing,
		makeLayout,
		clientRender
	);
}
