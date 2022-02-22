import { makeLayout } from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';
import { setOembedProviderLink, redirectWithoutLocaleifLoggedIn } from './controller';

export default ( router ) => {
	const locale = getLanguageRouteParam( 'locale' );

	router(
		[
			`/accept-invite/:site_id/:invitation_key/${ locale }`,
			`/accept-invite/:site_id/:invitation_key/:activation_key/${ locale }`,
			`/accept-invite/:site_id/:invitation_key/:activation_key/:auth_key/${ locale }`,
		],
		setOembedProviderLink,
		redirectWithoutLocaleifLoggedIn,
		makeLayout
	);
};
