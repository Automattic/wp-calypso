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
import CancelPurchase from './cancel-purchase';
import ConfirmCancelDomain from './confirm-cancel-domain';
import EditCardDetails from './payment/edit-card-details';
import Main from 'calypso/components/main';
import ManagePurchase from './manage-purchase';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import PurchasesHeader from './purchases-list/header';
import PurchasesList from './purchases-list';
import { concatTitle } from 'calypso/lib/react-helpers';
import { setDocumentHeadTitle } from 'calypso/state/document-head/actions';
import titles from './titles';
import { makeLayout, render as clientRender } from 'calypso/controller';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { managePurchase as managePurchaseUrl, purchasesRoot } from 'calypso/me/purchases/paths';

// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
function setTitle( context, ...title ) {
	context.store.dispatch( setDocumentHeadTitle( concatTitle( titles.purchases, ...title ) ) );
}

const userHasNoSites = ( state ) => getCurrentUserSiteCount( state ) <= 0;

function noSites( context, analyticsPath ) {
	setTitle( context );
	context.primary = (
		<Main className="purchases__no-site is-wide-layout">
			<PageViewTracker path={ analyticsPath } title="Purchases > No Sites" />
			<PurchasesHeader section={ 'purchases' } />
			<NoSitesMessage />
		</Main>
	);
	makeLayout( context, noop );
	clientRender( context );
}

export function addCardDetails( context, next ) {
	const state = context.store.getState();

	if ( userHasNoSites( state ) ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/payment/add' );
	}

	setTitle( context, titles.addCardDetails );

	context.primary = (
		<Main className="purchases__add-cart-details is-wide-layout">
			<AddCardDetails
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
				siteSlug={ context.params.site }
				getManagePurchaseUrlFor={ managePurchaseUrl }
				purchaseListUrl={ purchasesRoot }
				isFullWidth={ true }
			/>
		</Main>
	);
	next();
}

export function addCreditCard( context, next ) {
	context.primary = <AddCreditCard />;
	next();
}

export function cancelPurchase( context, next ) {
	setTitle( context, titles.cancelPurchase );
	const classes = 'cancel-purchase';

	context.primary = (
		<Main className={ classes }>
			<CancelPurchase
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
				siteSlug={ context.params.site }
			/>
		</Main>
	);
	next();
}

export function confirmCancelDomain( context, next ) {
	const state = context.store.getState();
	const classes = 'confirm-cancel-domain';

	if ( userHasNoSites( state ) ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/confirm-cancel-domain' );
	}

	setTitle( context, titles.confirmCancelDomain );

	context.primary = (
		<Main className={ classes }>
			<ConfirmCancelDomain
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
				siteSlug={ context.params.site }
			/>
		</Main>
	);
	next();
}

export function editCardDetails( context, next ) {
	const state = context.store.getState();

	if ( userHasNoSites( state ) ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/payment/edit/:cardId' );
	}

	setTitle( context, titles.editCardDetails );

	context.primary = (
		<EditCardDetails
			cardId={ context.params.cardId }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			siteSlug={ context.params.site }
			getManagePurchaseUrlFor={ managePurchaseUrl }
			purchaseListUrl={ purchasesRoot }
			isFullWidth={ false }
		/>
	);
	next();
}

export function list( context, next ) {
	setTitle( context );

	context.primary = <PurchasesList noticeType={ context.params.noticeType } />;
	next();
}

export function managePurchase( context, next ) {
	setTitle( context, titles.managePurchase );
	const classes = 'manage-purchase is-wide-layout';

	context.primary = (
		<Main className={ classes }>
			<ManagePurchase
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
				siteSlug={ context.params.site }
			/>
		</Main>
	);
	next();
}
