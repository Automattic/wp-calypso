/** @format */

/**
 * External dependencies
 */

import { noop, partial } from 'lodash';
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
import * as paths from './paths';
import PurchasesHeader from './purchases-list/header';
import PurchasesList from './purchases-list';
import { concatTitle, recordPageView } from 'lib/react-helpers';
import { setDocumentHeadTitle } from 'state/document-head/actions';
import titles from './titles';
import userFactory from 'lib/user';
import { makeLayout, render as clientRender } from 'controller';

const recordPurchasesPageView = partial( recordPageView, partial.placeholder, 'Purchases' );
const user = userFactory();

// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
function setTitle( context, ...title ) {
	context.store.dispatch( setDocumentHeadTitle( concatTitle( titles.purchases, ...title ) ) );
}

export default {
	addCardDetails( context, next ) {
		setTitle( context, titles.addCardDetails );

		recordPurchasesPageView( paths.addCardDetails(), 'Add Card Details' );

		context.primary = <AddCardDetails purchaseId={ parseInt( context.params.purchaseId, 10 ) } />;
		next();
	},

	addCreditCard( context, next ) {
		recordPurchasesPageView( paths.addCreditCard, 'Add Credit Card' );

		context.primary = <AddCreditCard />;
		next();
	},

	cancelPrivacyProtection( context, next ) {
		setTitle( context, titles.cancelPrivacyProtection );

		recordPurchasesPageView( paths.cancelPrivacyProtection(), 'Cancel Privacy Protection' );

		context.primary = (
			<CancelPrivacyProtection purchaseId={ parseInt( context.params.purchaseId, 10 ) } />
		);
		next();
	},

	cancelPurchase( context, next ) {
		setTitle( context, titles.cancelPurchase );

		recordPurchasesPageView( paths.cancelPurchase(), 'Cancel Purchase' );

		context.primary = <CancelPurchase purchaseId={ parseInt( context.params.purchaseId, 10 ) } />;
		next();
	},

	confirmCancelDomain( context, next ) {
		setTitle( context, titles.confirmCancelDomain );

		recordPurchasesPageView( paths.confirmCancelDomain(), 'Confirm Cancel Domain' );

		context.primary = (
			<ConfirmCancelDomain purchaseId={ parseInt( context.params.purchaseId, 10 ) } />
		);
		next();
	},

	editCardDetails( context, next ) {
		setTitle( context, titles.editCardDetails );

		recordPurchasesPageView( paths.editCardDetails(), 'Edit Card Details' );

		context.primary = (
			<EditCardDetails
				cardId={ context.params.cardId }
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			/>
		);
		next();
	},

	list( context, next ) {
		setTitle( context );

		recordPurchasesPageView( paths.purchasesRoot );

		context.primary = <PurchasesList noticeType={ context.params.noticeType } />;
		next();
	},

	managePurchase( context, next ) {
		setTitle( context, titles.managePurchase );

		recordPurchasesPageView( paths.managePurchase(), 'Manage Purchase' );

		context.primary = (
			<ManagePurchase
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
				destinationType={ context.params.destinationType }
			/>
		);
		next();
	},

	noSitesMessage( context, next ) {
		if ( user.get().site_count > 0 ) {
			return next();
		}

		setTitle( context );

		recordPurchasesPageView( context.path, 'No Sites' );

		context.primary = (
			<Main>
				<PurchasesHeader section={ 'purchases' } />
				<NoSitesMessage />
			</Main>
		);

		makeLayout( context, noop );
		clientRender( context );
	},
};
