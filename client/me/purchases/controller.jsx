/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal Dependencies
 */
import AddNewPaymentMethod from 'calypso/me/purchases/add-new-payment-method';
import AddPaymentMethod from 'calypso/me/purchases/manage-purchase/add-payment-method';
import ChangePaymentMethod from 'calypso/me/purchases/manage-purchase/change-payment-method';
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
import FormattedHeader from 'calypso/components/formatted-header';

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
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
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

	context.primary = (
		<Main className="purchases__cancel is-wide-layout">
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
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

	if ( userHasNoSites( state ) ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/confirm-cancel-domain' );
	}

	setTitle( context, titles.confirmCancelDomain );

	context.primary = (
		<Main className="purchases__cancel-domain confirm-cancel-domain is-wide-layout">
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
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
		<Main className="purchases__change is-wide-layout">
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<EditCardDetails
				cardId={ context.params.cardId }
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
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<PageViewTracker path="/me/purchases/:site/:purchaseId" title="Purchases > Manage Purchase" />
			<ManagePurchase
				purchaseId={ parseInt( context.params.purchaseId, 10 ) }
				siteSlug={ context.params.site }
			/>
		</Main>
	);
	next();
}

export function addNewPaymentMethod( context, next ) {
	context.primary = <AddNewPaymentMethod />;
	next();
}

export function addPaymentMethod( context, next ) {
	const state = context.store.getState();

	if ( userHasNoSites( state ) ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/payment-method/add' );
	}

	setTitle( context, titles.addPaymentMethod );

	context.primary = (
		<Main className="purchases__add-payment-method is-wide-layout">
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<AddPaymentMethod
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

export function changePaymentMethod( context, next ) {
	const state = context.store.getState();

	if ( userHasNoSites( state ) ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/payment-method/change/:cardId' );
	}

	setTitle( context, titles.editCardDetails );

	context.primary = (
		<Main className="purchases__edit-payment-method is-wide-layout">
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<ChangePaymentMethod
				cardId={ context.params.cardId }
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
