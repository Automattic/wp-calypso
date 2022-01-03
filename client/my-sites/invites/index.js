import page from 'page';
import { makeLayout, render as clientRender, setLocaleMiddleware } from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';
import { acceptInvite, redirectWithoutLocaleIfLoggedIn } from './controller';

export default () => {
	const locale = getLanguageRouteParam( 'locale' );

	page(
		[
			`/accept-invite/:site_id/:invitation_key/${ locale }`,
			`/accept-invite/:site_id/:invitation_key/:activation_key/${ locale }`,
			`/accept-invite/:site_id/:invitation_key/:activation_key/:auth_key/${ locale }`,
		],
		redirectWithoutLocaleIfLoggedIn,
		setLocaleMiddleware( 'locale' ),
		acceptInvite,
		makeLayout,
		clientRender
	);
};
