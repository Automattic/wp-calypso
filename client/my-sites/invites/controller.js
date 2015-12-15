/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal Dependencies
 */
import i18n from 'lib/mixins/i18n';
import titleActions from 'lib/screen-title/actions';
import InviteAccept from 'my-sites/invites/invite-accept';

export function acceptInvite( context ) {
	titleActions.setTitle( i18n.translate( 'Accept Invite', { textOnly: true } ) );

	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	context.layout.setState( { noSidebar: true } );

	ReactDom.render(
		React.createElement(
			InviteAccept,
			{
				siteId: context.params.site_id,
				inviteKey: context.params.invitation_key,
				activationKey: context.params.activation_key,
				authKey: context.params.auth_key
			}
		),
		document.getElementById( 'primary' )
	);
}
