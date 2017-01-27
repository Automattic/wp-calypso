/**
 * External Dependencies
 */
import { partial } from 'lodash';
import React from 'react';

/**
 * Internal Dependencies
 */
import AddCardDetails from './payment/add-card-details';
import AddCreditCard from './add-credit-card';
import CancelPrivacyProtection from './cancel-privacy-protection';
import CancelPurchase from './cancel-purchase';
import ConfirmCancelDomain from './confirm-cancel-domain';
import EditCardDetails from './payment/edit-card-details';
import Main from 'components/main';
import ManagePurchase from './manage-purchase';
import NoSitesMessage from 'components/empty-content/no-sites-message';
import paths from './paths';
import PurchasesHeader from './list/header';
import PurchasesList from './list';
import { receiveSite } from 'state/sites/actions';
import { concatTitle, recordPageView, renderPage } from 'lib/react-helpers';
import { setAllSitesSelected, setSelectedSiteId } from 'state/ui/actions';
import sitesFactory from 'lib/sites-list';
import { setDocumentHeadTitle } from 'state/document-head/actions';
import titles from './titles';
import userFactory from 'lib/user';

const recordPurchasesPageView = partial( recordPageView, partial.placeholder, 'Purchases' );
const sites = sitesFactory();
const user = userFactory();

// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
function setTitle( context, ...title ) {
	context.store.dispatch( setDocumentHeadTitle(
		concatTitle( titles.purchases, ...title )
	) );
}

/**
 * Populates `state.sites` and `state.ui` with the currently selected site.
 * TODO: Remove this once `sites-list` is removed from Calypso.
 *
 * @param {String} siteSlug - The slug of a site.
 * @param {Function} dispatch - Redux dispatcher
 */
const setSelectedSite = ( siteSlug, dispatch ) => {
	const setSelectedSiteCalls = () => {
		sites.setSelectedSite( siteSlug );
		const selectedSite = sites.getSelectedSite();
		dispatch( receiveSite( selectedSite ) );
		dispatch( setSelectedSiteId( selectedSite.ID ) );
	};

	if ( sites.select( siteSlug ) ) {
		setSelectedSiteCalls();
	} else if ( ! sites.initialized ) {
		sites.once( 'change', setSelectedSiteCalls );
	} else {
		// this is an edge case where the user has a purchase on a site they no
		// longer have access to.
		dispatch( setAllSitesSelected() );
	}
};

export default {
	addCardDetails( context ) {
		setTitle(
			context,
			titles.addCardDetails
		);

		recordPurchasesPageView(
			paths.addCardDetails(),
			'Add Card Details'
		);

		setSelectedSite( context.params.site, context.store.dispatch );

		renderPage(
			context,
			<AddCardDetails
				purchaseId={ parseInt( context.params.purchaseId, 10 ) } />
		);
	},

	addCreditCard( context ) {
		recordPurchasesPageView(
			paths.addCreditCard(),
			'Add Credit Card'
		);

		renderPage(
			context,
			<AddCreditCard />
		);
	},

	cancelPrivacyProtection( context ) {
		setTitle(
			context,
			titles.cancelPrivacyProtection
		);

		recordPurchasesPageView(
			paths.cancelPrivacyProtection(),
			'Cancel Privacy Protection'
		);

		setSelectedSite( context.params.site, context.store.dispatch );

		renderPage(
			context,
			<CancelPrivacyProtection
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			/>
		);
	},

	cancelPurchase( context ) {
		setTitle(
			context,
			titles.cancelPurchase
		);

		recordPurchasesPageView(
			paths.cancelPurchase(),
			'Cancel Purchase'
		);

		setSelectedSite( context.params.site, context.store.dispatch );

		renderPage(
			context,
			<CancelPurchase
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			/>
		);
	},

	confirmCancelDomain( context ) {
		setTitle(
			context,
			titles.confirmCancelDomain
		);

		recordPurchasesPageView(
			paths.confirmCancelDomain(),
			'Confirm Cancel Domain'
		);

		setSelectedSite( context.params.site, context.store.dispatch );

		renderPage(
			context,
			<ConfirmCancelDomain
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			/>
		);
	},

	editCardDetails( context ) {
		setTitle(
			context,
			titles.editCardDetails
		);

		recordPurchasesPageView(
			paths.editCardDetails(),
			'Edit Card Details'
		);

		setSelectedSite( context.params.site, context.store.dispatch );

		renderPage(
			context,
			<EditCardDetails
				cardId={ context.params.cardId }
				purchaseId={ parseInt( context.params.purchaseId, 10 ) } />
		);
	},

	list( context ) {
		setTitle( context );

		recordPurchasesPageView(
			paths.purchasesRoot()
		);

		renderPage(
			context,
			<PurchasesList
				sites={ sites }
				noticeType={ context.params.noticeType }
			/>
		);
	},

	managePurchase( context ) {
		setTitle(
			context,
			titles.managePurchase
		);

		recordPurchasesPageView(
			paths.managePurchase(),
			'Manage Purchase'
		);

		setSelectedSite( context.params.site, context.store.dispatch );

		renderPage(
			context,
			<ManagePurchase
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
				destinationType={ context.params.destinationType }
			/>
		);
	},

	noSitesMessage( context, next ) {
		if ( user.get().site_count > 0 ) {
			return next();
		}

		setTitle( context );

		recordPurchasesPageView(
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
