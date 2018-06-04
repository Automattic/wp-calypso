/** @format */

/**
 * External dependencies
 */

import { noop } from 'lodash';
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
import PurchasesHeader from './purchases-list/header';
import PurchasesList from './purchases-list';
import { concatTitle } from 'lib/react-helpers';
import { setDocumentHeadTitle } from 'state/document-head/actions';
import titles from './titles';
import userFactory from 'lib/user';
import { makeLayout, render as clientRender } from 'controller';
import PageViewTracker from 'lib/analytics/page-view-tracker';

const user = userFactory();

// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
function setTitle( context, ...title ) {
	context.store.dispatch( setDocumentHeadTitle( concatTitle( titles.purchases, ...title ) ) );
}

const userHasNoSites = () => user.get().site_count <= 0;

function noSites( context, analyticsPath ) {
	setTitle( context );
	context.primary = (
		<Main>
			<PageViewTracker path={ analyticsPath } title="Purchases > No Sites" />
			<PurchasesHeader section={ 'purchases' } />
			<NoSitesMessage />
		</Main>
	);
	makeLayout( context, noop );
	clientRender( context );
}

export function addCardDetails( context, next ) {
	if ( userHasNoSites() ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/payment/add' );
	}

	setTitle( context, titles.addCardDetails );

	context.primary = <AddCardDetails purchaseId={ parseInt( context.params.purchaseId, 10 ) } />;
	next();
}

export function addCreditCard( context, next ) {
	context.primary = <AddCreditCard />;
	next();
}

export function cancelPrivacyProtection( context, next ) {
	if ( userHasNoSites() ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/cancel-privacy-protection' );
	}

	setTitle( context, titles.cancelPrivacyProtection );

	context.primary = (
		<CancelPrivacyProtection purchaseId={ parseInt( context.params.purchaseId, 10 ) } />
	);
	next();
}

export function cancelPurchase( context, next ) {
	if ( userHasNoSites() ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/cancel' );
	}

	setTitle( context, titles.cancelPurchase );

	context.primary = <CancelPurchase purchaseId={ parseInt( context.params.purchaseId, 10 ) } />;
	next();
}

export function confirmCancelDomain( context, next ) {
	if ( userHasNoSites() ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/confirm-cancel-domain' );
	}

	setTitle( context, titles.confirmCancelDomain );

	context.primary = (
		<ConfirmCancelDomain
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			siteSlug={ context.params.site }
		/>
	);
	next();
}

export function editCardDetails( context, next ) {
	if ( userHasNoSites() ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/payment/edit/:cardId' );
	}

	setTitle( context, titles.editCardDetails );

	context.primary = (
		<EditCardDetails
			cardId={ context.params.cardId }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			siteSlug={ context.params.site }
		/>
	);
	next();
}

export function list( context, next ) {
	if ( userHasNoSites() ) {
		return noSites( context, '/me/purchases' );
	}

	setTitle( context );

	context.primary = <PurchasesList noticeType={ context.params.noticeType } />;
	next();
}

export function managePurchase( context, next ) {
	if ( userHasNoSites() ) {
		return noSites( context, '/me/purchases/:site/:purchaseId' );
	}

	setTitle( context, titles.managePurchase );

	context.primary = <ManagePurchase purchaseId={ parseInt( context.params.purchaseId, 10 ) } />;
	next();
}
