/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'analytics';
import ConfirmCancelPurchase from './confirm-cancel-purchase';
import ConfirmCancelPurchaseLoadingPlaceholder from './confirm-cancel-purchase/loading-placeholder';
import CancelPurchase from './cancel-purchase';
import CancelPurchaseLoadingPlaceholder from './cancel-purchase/loading-placeholder';
import CancelPrivateRegistration from './cancel-private-registration';
import EditCardDetails from './payment/edit-card-details';
import EditCardDetailsData from 'components/data/purchases/edit-card-details';
import EditCardDetailsLoadingPlaceholder from './payment/edit-card-details/loading-placeholder';
import EditPaymentMethod from './payment/edit-payment-method';
import Main from 'components/main';
import ManagePurchaseData from 'components/data/purchases/manage-purchase';
import ManagePurchase from './manage-purchase';
import NoSitesMessage from 'components/empty-content/no-sites-message';
import paths from './paths';
import PurchasesData from 'components/data/purchases';
import PurchasesList from './list';
import sitesFactory from 'lib/sites-list';
import titleActions from 'lib/screen-title/actions';
import titles from './titles';
import userFactory from 'lib/user';
import { isDataLoading } from './utils';

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
	ReactDom.render(
		component,
		document.getElementById( 'primary' )
	);
}

function setTitle( ...title ) {
	titleActions.setTitle(
		concatTitle( titles.purchases, ...title )
	);
}

export default {
	cancelPurchase( context ) {
		setTitle(
			titles.cancelPurchase
		);

		recordPageView(
			paths.cancelPurchase(),
			'Cancel Purchase'
		);

		sites.setSelectedSite( context.params.site );

		renderPage(
			<ManagePurchaseData
				component={ CancelPurchase }
				isDataLoading={ isDataLoading }
				loadingPlaceholder={ CancelPurchaseLoadingPlaceholder }
				purchaseId={ context.params.purchaseId }
				sites={ sites } />
		);
	},

	cancelPrivateRegistration( context ) {
		setTitle(
			titles.cancelPrivateRegistration
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
			titles.confirmCancelPurchase
		);

		recordPageView(
			paths.confirmCancelPurchase(),
			'Confirm Cancel Purchase'
		);

		sites.setSelectedSite( context.params.site );

		renderPage(
			<ManagePurchaseData
				component={ ConfirmCancelPurchase }
				isDataLoading={ isDataLoading }
				loadingPlaceholder={ ConfirmCancelPurchaseLoadingPlaceholder }
				purchaseId={ context.params.purchaseId }
				sites={ sites } />
		);
	},

	editCardDetails( context ) {
		setTitle(
			titles.editCardDetails
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
				loadingPlaceholder={ EditCardDetailsLoadingPlaceholder }
				sites={ sites } />
		);
	},

	editPaymentMethod( context ) {
		setTitle(
			titles.editPaymentMethod
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

	list( context ) {
		setTitle();

		recordPageView(
			paths.list()
		);

		renderPage(
			<PurchasesData
				component={ PurchasesList }
				noticeType={ context.params.noticeType }
				sites={ sites } />
		);
	},

	managePurchase( context ) {
		setTitle(
			titles.managePurchase
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
