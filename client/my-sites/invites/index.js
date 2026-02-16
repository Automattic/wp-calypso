import page from '@automattic/calypso-router';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { maybeUseUnifiedInvite } from '../invites-unified/controller';
import { acceptInvite, redirectWithoutLocaleifLoggedIn } from './controller';

export default () => {
	const locale = getLanguageRouteParam( 'locale' );

	// Invite routes with unified flow check
	// maybeUseUnifiedInvite checks for CIAB sites or ?unified=1 flag
	// If unified should be used, it renders the unified UI
	// Otherwise, it calls next() and the legacy acceptInvite runs
	page(
		[
			`/accept-invite/:site_id/:invitation_key/${ locale }`,
			`/accept-invite/:site_id/:invitation_key/:activation_key/${ locale }`,
			`/accept-invite/:site_id/:invitation_key/:activation_key/:auth_key/${ locale }`,
		],
		redirectWithoutLocaleifLoggedIn,
		maybeUseUnifiedInvite,
		acceptInvite,
		makeLayout,
		clientRender
	);
};
