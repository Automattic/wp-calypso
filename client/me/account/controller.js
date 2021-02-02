/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userSettings from 'calypso/lib/user-settings';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import AccountComponent, { noticeId as meSettingsNoticeId } from 'calypso/me/account/main';
import { successNotice } from 'calypso/state/notices/actions';

export function account( context, next ) {
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( translate( 'Account Settings', { textOnly: true } ) ) );

	// Update the url and show the notice after a redirect
	if ( context.query && context.query.updated === 'success' ) {
		context.store.dispatch(
			successNotice( translate( 'Settings saved successfully!' ), {
				displayOnNextPage: true,
				id: meSettingsNoticeId,
			} )
		);
		page.replace( context.pathname );
	}

	context.primary = React.createElement( AccountComponent, {
		userSettings: userSettings,
		path: context.path,
	} );
	next();
}
