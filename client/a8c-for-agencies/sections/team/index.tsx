import page from '@automattic/calypso-router';
import {
	A4A_TEAM_ACCEPT_INVITE_LINK,
	A4A_TEAM_INVITE_LINK,
	A4A_TEAM_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { teamAcceptInviteContext, teamContext, teamInviteContext } from './controller';

export default function () {
	page( A4A_TEAM_INVITE_LINK, requireAccessContext, teamInviteContext, makeLayout, clientRender );

	page( A4A_TEAM_ACCEPT_INVITE_LINK, teamAcceptInviteContext, makeLayout, clientRender );

	page( A4A_TEAM_LINK, requireAccessContext, teamContext, makeLayout, clientRender );

	// The active/invited members tabs were merged into a single list. Redirect
	// the retired tab URLs back to the combined team screen.
	page( `${ A4A_TEAM_LINK }/active-members`, () => page.redirect( A4A_TEAM_LINK ) );
	page( `${ A4A_TEAM_LINK }/invited-members`, () => page.redirect( A4A_TEAM_LINK ) );
}
