import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, setLocaleMiddleware } from 'calypso/controller';
import { serverRouter } from 'calypso/server/isomorphic-routing';

export default ( router: ReturnType< typeof serverRouter > ) => {
	const lang = getLanguageRouteParam();

	router(
		[ `/${ lang }/pricing(/*)?`, `/${ lang }/plans(/*)?` ],
		setLocaleMiddleware(),
		makeLayout
	);
};
