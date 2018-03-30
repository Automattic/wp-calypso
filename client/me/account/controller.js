/** @format */

/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userSettings from 'lib/user-settings';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import AccountComponent from 'me/account/main';
import username from 'lib/username';

export default {
	account( context, next ) {
		let showNoticeInitially = false;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Account Settings', { textOnly: true } ) ) );

		// Update the url and show the notice after a redirect
		if ( context.query && context.query.updated === 'success' ) {
			showNoticeInitially = true;
			page.replace( context.pathname );
		}

		context.primary = React.createElement( AccountComponent, {
			userSettings: userSettings,
			path: context.path,
			username: username,
			showNoticeInitially: showNoticeInitially,
		} );
		next();
	},
};
