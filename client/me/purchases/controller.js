/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'analytics';
import ConfirmCancelPurchase from './confirm-cancel-purchase';
import CancelPurchase from './cancel-purchase';
import CancelPrivateRegistration from './cancel-private-registration';
import EditCardDetails from './payment/edit-card-details';
import EditCardDetailsData from 'components/data/purchases/edit-card-details';
import EditPaymentMethod from './payment/edit-payment-method';
import i18n from 'lib/mixins/i18n';
import Main from 'components/main';
import ManagePurchaseData from 'components/data/purchases/manage-purchase';
import ManagePurchase from './manage-purchase';
import NoSitesMessage from 'components/empty-content/no-sites-message';
import paths from './paths';
import PurchasesData from 'components/data/purchases';
import PurchasesList from './list';
import sitesFactory from 'lib/sites-list';
import titleActions from 'lib/screen-title/actions';
import userFactory from 'lib/user';

const sites = sitesFactory();
const user = userFactory();

function concatTitle( ...parts ) {
	return parts.join( ' › ' );
}

function recordPageView( path, ...title ) {
	analytics.pageView.record(
		path,
		concatTitle( 'Purchases', ...title )
	);
}

function renderPage( component ) {
	React.render(
		component,
		document.getElementById( 'primary' )
	);
}

function setTitle( ...title ) {
	titleActions.setTitle(
		concatTitle( i18n.translate( 'Purchases' ), ...title )
	);
}

export default {
	cancelPurchase( context ) {
		setTitle(
			i18n.translate( 'Cancel Purchase' )
		);

		recordPageView(
			paths.cancelPurchase(),
			'Cancel Purchase'
		);

		sites.setSelectedSite( context.params.site );

		renderPage(
			<ManagePurchaseData
				component={ CancelPurchase }
				purchaseId={ context.params.purchaseId }
				sites={ sites } />
		);
	},

	cancelPrivateRegistration( context ) {
		setTitle(
			i18n.translate( 'Cancel Private Registration' )
		);

		recordPageView(
			paths.cancelPrivateRegistration(),
			'Cancel Private Registration'
		);

		sites.setSelectedSite( context.params.site );

		renderPage(
			<ManagePurchaseData
				component={ CancelPrivateRegistration }
				purchaseId={ context.params.purchaseId }
				sites={ sites } />
		);
	},

	confirmCancelPurchase( context ) {
		setTitle(
			i18n.translate( 'Confirm Cancel Purchase' )
		);

		recordPageView(
			paths.confirmCancelPurchase(),
			'Confirm Cancel Purchase'
		);

		sites.setSelectedSite( context.params.site );

		renderPage(
			<ManagePurchaseData
				component={ ConfirmCancelPurchase }
				purchaseId={ context.params.purchaseId }
				sites={ sites } />
		);
	},

	editCardDetails( context ) {
		setTitle(
			i18n.translate( 'Edit Card Details' )
		);

		recordPageView(
			paths.editCardDetails(),
			'Edit Card Details'
		);

		sites.setSelectedSite( context.params.site );

		renderPage(
			<EditCardDetailsData
				cardId={ context.params.cardId }
				component={ EditCardDetails }
				purchaseId={ context.params.purchaseId }
				sites={ sites } />
		);
	},

	editPaymentMethod( context ) {
		setTitle(
			i18n.translate( 'Edit Payment Method' )
		);

		recordPageView(
			paths.editPaymentMethod(),
			'Edit Payment Method'
		);

		sites.setSelectedSite( context.params.site );

		renderPage(
			<ManagePurchaseData
				component={ EditPaymentMethod }
				purchaseId={ context.params.purchaseId }
				sites={ sites } />
		);
	},

	list() {
		setTitle();

		recordPageView(
			paths.list()
		);

		renderPage(
			<PurchasesData
				component={ PurchasesList } />
		);
	},

	managePurchase( context ) {
		setTitle(
			i18n.translate( 'Manage Purchase' )
		);

		analytics.pageView.record(
			paths.managePurchase(),
			'Manage Purchase'
		);

		sites.setSelectedSite( context.params.site );

		renderPage(
			<ManagePurchaseData
				component={ ManagePurchase }
				purchaseId={ context.params.purchaseId }
				destinationType={ context.params.destinationType }
				sites={ sites } />
		);
	},

	noSitesMessage( context, next ) {
		if ( user.get().site_count > 0 ) {
			return next();
		}

		setTitle();

		recordPageView(
			context.path,
			'No Sites'
		);

		renderPage(
			<Main>
				<NoSitesMessage />
			</Main>
		);
	}
};
