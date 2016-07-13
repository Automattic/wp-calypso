/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import CancelPrivateRegistration from './cancel-private-registration';
import CancelPurchase from './cancel-purchase';
import CancelPurchaseLoadingPlaceholder from './cancel-purchase/loading-placeholder';
import ConfirmCancelDomain from './confirm-cancel-domain';
import EditCardDetails from './payment/edit-card-details';
import EditCardDetailsData from 'components/data/purchases/edit-card-details';
import EditCardDetailsLoadingPlaceholder from './payment/edit-card-details/loading-placeholder';
import { isDataLoading } from './utils';
import Main from 'components/main';
import ManagePurchase from './manage-purchase';
import ManagePurchaseData from 'components/data/purchases/manage-purchase';
import NoSitesMessage from 'components/empty-content/no-sites-message';
import notices from 'notices';
import paths from './paths';
import PurchasesData from 'components/data/purchases';
import PurchasesHeader from './list/header';
import PurchasesList from './list';
import { renderWithReduxStore } from 'lib/react-helpers';
import sitesFactory from 'lib/sites-list';
import supportPaths from 'lib/url/support';
import titleActions from 'lib/screen-title/actions';
import titles from './titles';
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

function renderPage( context, component ) {
	renderWithReduxStore(
		component,
		document.getElementById( 'primary' ),
		context.store
	);
}

function setTitle( ...title ) {
	titleActions.setTitle(
		concatTitle( titles.purchases, ...title )
	);
}

export default {
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
			context,
			<ManagePurchaseData
				component={ CancelPrivateRegistration }
				purchaseId={ context.params.purchaseId }
				sites={ sites } />
		);
	},

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
			context,
			<ManagePurchaseData
				component={ CancelPurchase }
				isDataLoading={ isDataLoading }
				loadingPlaceholder={ CancelPurchaseLoadingPlaceholder }
				purchaseId={ context.params.purchaseId }
				sites={ sites } />
		);
	},

	confirmCancelDomain( context ) {
		setTitle(
			titles.confirmCancelDomain
		);

		recordPageView(
			paths.confirmCancelDomain(),
			'Confirm Cancel Domain'
		);

		sites.setSelectedSite( context.params.site );

		renderPage(
			context,
			<ManagePurchaseData
				component={ ConfirmCancelDomain }
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
			context,
			<EditCardDetailsData
				cardId={ context.params.cardId }
				component={ EditCardDetails }
				purchaseId={ context.params.purchaseId }
				loadingPlaceholder={ EditCardDetailsLoadingPlaceholder }
				sites={ sites } />
		);
	},

	list( context ) {
		setTitle();

		recordPageView(
			paths.list()
		);

		renderPage(
			context,
			<PurchasesData
				component={ PurchasesList }
				noticeType={ context.params.noticeType }
				sites={ sites } />
		);
	},

	listNotice( context ) {
		page.redirect( paths.list() );

		const { noticeType } = context.params;

		if ( noticeType === 'cancel-success' ) {
			notices.success( i18n.translate(
				'Your purchase was canceled and refunded. The refund may take up to ' +
				'7 days to appear in your PayPal/bank/credit card account.'
			), { persistent: true } );
		}

		if ( noticeType === 'cancel-problem' ) {
			notices.error( i18n.translate(
				'There was a problem canceling your purchase. ' +
				'Please {{a}}contact support{{/a}} for more information.',
				{
					components: {
						a: <a href={ supportPaths.CALYPSO_CONTACT } />
					}
				}
			), { persistent: true } );
		}
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
			context,
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
			context,
			<Main>
				<PurchasesHeader section={ 'purchases' } />
				<NoSitesMessage />
			</Main>
		);
	}
};
