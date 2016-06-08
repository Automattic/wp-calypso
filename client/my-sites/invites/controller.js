/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import store from 'store';
import page from 'page';
import get from 'lodash/get';
import debugModule from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import titleActions from 'lib/screen-title/actions';
import InviteAccept from 'my-sites/invites/invite-accept';
import { setSection } from 'state/ui/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import { getRedirectAfterAccept } from 'my-sites/invites/utils';
import { acceptInvite as acceptInviteAction } from 'lib/invites/actions';
import _user from 'lib/user';
import i18nUtils from 'lib/i18n-utils';
import pick from 'lodash/pick';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

/**
 * Module variables
 */
const user = _user();
const debug = debugModule( 'calypso:invite-accept:controller' );

function getLocale( parameters ) {
	const paths = [ 'site_id', 'invitation_key', 'activation_key', 'auth_key', 'locale' ];
	return find( pick( parameters, paths ), isLocale );
}

function isLocale( pathFragment ) {
	return ! isEmpty( i18nUtils.getLanguage( pathFragment ) );
}

export function redirectWithoutLocaleifLoggedIn( context, next ) {
	if ( user.get() && i18nUtils.getLocaleFromPath( context.path ) ) {
		let urlWithoutLocale = i18nUtils.removeLocaleFromPath( context.path );
		return page.redirect( urlWithoutLocale );
	}

	next();
}

export function acceptInvite( context ) {
	titleActions.setTitle( i18n.translate( 'Accept Invite', { textOnly: true } ) );

	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	const acceptedInvite = store.get( 'invite_accepted' );
	if ( acceptedInvite ) {
		debug( 'invite_accepted is set in localStorage' );
		if ( user.get().email === acceptedInvite.sentTo ) {
			debug( 'Setting email_verified in user object' );
			user.set( { email_verified: true } );
		}
		store.remove( 'invite_accepted' );
		const acceptInviteCallback = error => {
			if ( error ) {
				debug( 'Accept invite error: ' + JSON.stringify( error ) );
				page( window.location.href );
			} else if ( get( acceptedInvite, 'site.is_vip' ) ) {
				debug( 'Accepted invite for VIP sites' );
				window.location.href = getRedirectAfterAccept( acceptedInvite );
			} else {
				const redirect = getRedirectAfterAccept( acceptedInvite );
				debug( 'Accepted invite and redirecting to:  ' + redirect );
				page( redirect );
			}
		};

		acceptInviteAction( acceptedInvite, acceptInviteCallback )( context.store.dispatch );
		return;
	}

	renderWithReduxStore(
		React.createElement(
			InviteAccept,
			{
				siteId: context.params.site_id,
				inviteKey: context.params.invitation_key,
				activationKey: context.params.activation_key,
				authKey: context.params.auth_key,
				locale: getLocale( context.params ),
				path: context.path
			}
		),
		document.getElementById( 'primary' ),
		context.store
	);
}
