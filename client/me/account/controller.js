/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import userSettings from 'lib/user-settings';
import titleActions from 'lib/screen-title/actions';
import { renderWithReduxStore } from 'lib/react-helpers';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	account( context ) {
		const AccountComponent = require( 'me/account/main' );
		const username = require( 'lib/username' );
		const basePath = context.path;
		let showNoticeInitially = false;

		titleActions.setTitle( i18n.translate( 'Account Settings', { textOnly: true } ) );

		// Update the url and show the notice after a redirect
		if ( context.query && context.query.updated === 'success' ) {
			showNoticeInitially = true;
			page.replace( context.pathname );
		}

		// We don't want to record the event twice if we are replacing the url
		if ( ! showNoticeInitially ) {
			analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Account Settings' );
		}

		renderWithReduxStore(
			React.createElement( AccountComponent,
				{
					userSettings: userSettings,
					path: context.path,
					username: username,
					showNoticeInitially: showNoticeInitially
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
