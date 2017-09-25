/**
 * External dependencies
 */
import { partial } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import AddCreditCard from './add-credit-card';
import CancelPrivacyProtection from './cancel-privacy-protection';
import CancelPurchase from './cancel-purchase';
import ConfirmCancelDomain from './confirm-cancel-domain';
import ManagePurchase from './manage-purchase';
import paths from './paths';
import AddCardDetails from './payment/add-card-details';
import EditCardDetails from './payment/edit-card-details';
import PurchasesList from './purchases-list';
import PurchasesHeader from './purchases-list/header';
import titles from './titles';
import NoSitesMessage from 'components/empty-content/no-sites-message';
import Main from 'components/main';
import { concatTitle, recordPageView, renderPage } from 'lib/react-helpers';
import userFactory from 'lib/user';
import { setDocumentHeadTitle } from 'state/document-head/actions';

const recordPurchasesPageView = partial( recordPageView, partial.placeholder, 'Purchases' );
const user = userFactory();

// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
function setTitle( context, ...title ) {
	context.store.dispatch( setDocumentHeadTitle( concatTitle( titles.purchases, ...title ) ) );
}

export default {
	addCardDetails( context ) {
		setTitle( context, titles.addCardDetails );

		recordPurchasesPageView( paths.addCardDetails(), 'Add Card Details' );

		renderPage(
			context,
			<AddCardDetails purchaseId={ parseInt( context.params.purchaseId, 10 ) } />
		);
	},

	addCreditCard( context ) {
		recordPurchasesPageView( paths.addCreditCard(), 'Add Credit Card' );

		renderPage( context, <AddCreditCard /> );
	},

	cancelPrivacyProtection( context ) {
		setTitle( context, titles.cancelPrivacyProtection );

		recordPurchasesPageView( paths.cancelPrivacyProtection(), 'Cancel Privacy Protection' );

		renderPage(
			context,
			<CancelPrivacyProtection purchaseId={ parseInt( context.params.purchaseId, 10 ) } />
		);
	},

	cancelPurchase( context ) {
		setTitle( context, titles.cancelPurchase );

		recordPurchasesPageView( paths.cancelPurchase(), 'Cancel Purchase' );

		renderPage(
			context,
			<CancelPurchase purchaseId={ parseInt( context.params.purchaseId, 10 ) } />
		);
	},

	confirmCancelDomain( context ) {
		setTitle( context, titles.confirmCancelDomain );

		recordPurchasesPageView( paths.confirmCancelDomain(), 'Confirm Cancel Domain' );

		renderPage(
			context,
			<ConfirmCancelDomain purchaseId={ parseInt( context.params.purchaseId, 10 ) } />
		);
	},

	editCardDetails( context ) {
		setTitle( context, titles.editCardDetails );

		recordPurchasesPageView( paths.editCardDetails(), 'Edit Card Details' );

		renderPage(
			context,
			<EditCardDetails
				cardId={ context.params.cardId }
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			/>
		);
	},

	list( context ) {
		setTitle( context );

		recordPurchasesPageView( paths.purchasesRoot() );

		renderPage( context, <PurchasesList noticeType={ context.params.noticeType } /> );
	},

	managePurchase( context ) {
		setTitle( context, titles.managePurchase );

		recordPurchasesPageView( paths.managePurchase(), 'Manage Purchase' );

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

		recordPurchasesPageView( context.path, 'No Sites' );

		renderPage(
			context,
			<Main>
				<PurchasesHeader section={ 'purchases' } />
				<NoSitesMessage />
			</Main>
		);
	},
};
