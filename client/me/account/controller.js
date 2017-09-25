/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import userSettings from 'lib/user-settings';
import username from 'lib/username';
import AccountComponent from 'me/account/main';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	account( context ) {
	    const basePath = context.path;
		let showNoticeInitially = false;

		context.store.dispatch( setTitle( i18n.translate( 'Account Settings', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

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
