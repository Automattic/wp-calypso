/** @format */

/**
 * External dependencies
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
import PurchasesHeader from './purchases-list/header';
import PurchasesList from './purchases-list';
import { concatTitle, recordPageView, renderWithReduxStore } from 'lib/react-helpers';
import { setDocumentHeadTitle } from 'state/document-head/actions';
import titles from './titles';
import userFactory from 'lib/user';

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

		renderWithReduxStore(
			<AddCardDetails purchaseId={ parseInt( context.params.purchaseId, 10 ) } />,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	addCreditCard( context ) {
		recordPurchasesPageView( paths.addCreditCard(), 'Add Credit Card' );

		renderWithReduxStore( <AddCreditCard />, document.getElementById( 'primary' ), context.store );
	},

	cancelPrivacyProtection( context ) {
		setTitle( context, titles.cancelPrivacyProtection );

		recordPurchasesPageView( paths.cancelPrivacyProtection(), 'Cancel Privacy Protection' );

		renderWithReduxStore(
			<CancelPrivacyProtection purchaseId={ parseInt( context.params.purchaseId, 10 ) } />,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	cancelPurchase( context ) {
		setTitle( context, titles.cancelPurchase );

		recordPurchasesPageView( paths.cancelPurchase(), 'Cancel Purchase' );

		renderWithReduxStore(
			<CancelPurchase purchaseId={ parseInt( context.params.purchaseId, 10 ) } />,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	confirmCancelDomain( context ) {
		setTitle( context, titles.confirmCancelDomain );

		recordPurchasesPageView( paths.confirmCancelDomain(), 'Confirm Cancel Domain' );

		renderWithReduxStore(
			<ConfirmCancelDomain purchaseId={ parseInt( context.params.purchaseId, 10 ) } />,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	editCardDetails( context ) {
		setTitle( context, titles.editCardDetails );

		recordPurchasesPageView( paths.editCardDetails(), 'Edit Card Details' );

		renderWithReduxStore(
			<EditCardDetails
				cardId={ context.params.cardId }
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			/>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	list( context ) {
		setTitle( context );

		recordPurchasesPageView( paths.purchasesRoot() );

		renderWithReduxStore(
			<PurchasesList noticeType={ context.params.noticeType } />,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	managePurchase( context ) {
		setTitle( context, titles.managePurchase );

		recordPurchasesPageView( paths.managePurchase(), 'Manage Purchase' );

		renderWithReduxStore(
			<ManagePurchase
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
				destinationType={ context.params.destinationType }
			/>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	noSitesMessage( context, next ) {
		if ( user.get().site_count > 0 ) {
			return next();
		}

		setTitle( context );

		recordPurchasesPageView( context.path, 'No Sites' );

		renderWithReduxStore(
			<Main>
				<PurchasesHeader section={ 'purchases' } />
				<NoSitesMessage />
			</Main>,
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
