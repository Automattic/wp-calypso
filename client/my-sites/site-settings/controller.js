/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import purchasesPaths from 'me/purchases/paths';
import { renderWithReduxStore } from 'lib/react-helpers';
import SiteSettingsComponent from 'my-sites/site-settings/main';
import ImportSettings from './section-import';
import ExportSettings from './section-export';

function renderPage( context, component ) {
	renderWithReduxStore(
		component,
		document.getElementById( 'primary' ),
		context.store
	);
}

const controller = {
	redirectToGeneral() {
		page.redirect( '/settings/general' );
	},

	importSite( context ) {
		renderPage( context, <ImportSettings /> );
	},

	exportSite( context ) {
		renderPage( context, <ExportSettings /> );
	},

	guidedTransfer( context ) {
		renderPage(
			context,
			<SiteSettingsComponent section="guidedTransfer" hostSlug={ context.params.host_slug } />
		);
	},

	legacyRedirects( context, next ) {
		const section = context.params.section,
			redirectMap = {
				account: '/me/account',
				password: '/me/security',
				'public-profile': '/me/public-profile',
				notifications: '/me/notifications',
				disbursements: '/me/public-profile',
				earnings: '/me/public-profile',
				'billing-history': purchasesPaths.billingHistory(),
				'billing-history-v2': purchasesPaths.billingHistory(),
				'connected-apps': '/me/security/connected-applications'
			};
		if ( ! context ) {
			return page( '/me/public-profile' );
		}
		if ( redirectMap[ section ] ) {
			return page.redirect( redirectMap[ section ] );
		}
		next();
	},
};

export default controller;
