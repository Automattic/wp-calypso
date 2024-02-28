import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	clientRouter,
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller/index.web';
import { fetchPatterns, renderPatterns } from 'calypso/my-sites/patterns/controller';

export default function ( router: typeof clientRouter ) {
	const langParam = getLanguageRouteParam();
	const middleware = [ fetchPatterns, renderPatterns, makeLayout, clientRender ];

	router( `/${ langParam }/patterns`, redirectWithoutLocaleParamInFrontIfLoggedIn, ...middleware );
	router( '/patterns', ...middleware );
}
