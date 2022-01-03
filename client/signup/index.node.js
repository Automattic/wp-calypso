import { setLocaleMiddleware } from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';

export default function ( router ) {
	const lang = getLanguageRouteParam();

	router(
		[
			`/start/${ lang }`,
			`/start/:flowName/${ lang }`,
			`/start/:flowName/:stepName/${ lang }`,
			`/start/:flowName/:stepName/:stepSectionName/${ lang }`,
		],
		setLocaleMiddleware()
	);
}
