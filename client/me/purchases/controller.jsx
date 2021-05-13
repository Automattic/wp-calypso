/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import AddNewPaymentMethod from 'calypso/me/purchases/add-new-payment-method';
import ChangePaymentMethod from 'calypso/me/purchases/manage-purchase/change-payment-method';
import CancelPurchase from './cancel-purchase';
import ConfirmCancelDomain from './confirm-cancel-domain';
import Main from 'calypso/components/main';
import ManagePurchase from './manage-purchase';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import PurchasesList from './purchases-list';
import DocumentHead from 'calypso/components/data/document-head';
import titles from './titles';
import { makeLayout, render as clientRender } from 'calypso/controller';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { managePurchase as managePurchaseUrl, purchasesRoot } from 'calypso/me/purchases/paths';
import FormattedHeader from 'calypso/components/formatted-header';

const PurchasesWrapper = ( { title = null, children } ) => {
	return (
		<React.Fragment>
			<DocumentHead title={ title } />
			{ children }
		</React.Fragment>
	);
};
const noop = () => {};
const userHasNoSites = ( state ) => getCurrentUserSiteCount( state ) <= 0;

function noSites( context, analyticsPath ) {
	const NoSitesWrapper = localize( () => {
		return (
			<PurchasesWrapper>
				<Main wideLayout className="purchases__no-site">
					<PageViewTracker path={ analyticsPath } title="Purchases > No Sites" />
					<PurchasesNavigation section="activeUpgrades" />
					<NoSitesMessage />
				</Main>
			</PurchasesWrapper>
		);
	} );

	context.primary = <NoSitesWrapper />;
	makeLayout( context, noop );
	clientRender( context );
}

export function addCreditCard( context, next ) {
	context.primary = <AddNewPaymentMethod />;
	next();
}

export function cancelPurchase( context, next ) {
	const CancelPurchaseWrapper = localize( () => {
		return (
			<PurchasesWrapper title={ titles.cancelPurchase }>
				<Main wideLayout className="purchases__cancel">
					<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
					<CancelPurchase
						purchaseId={ parseInt( context.params.purchaseId, 10 ) }
						siteSlug={ context.params.site }
					/>
				</Main>
			</PurchasesWrapper>
		);
	} );

	context.primary = <CancelPurchaseWrapper />;
	next();
}

export function confirmCancelDomain( context, next ) {
	const state = context.store.getState();

	if ( userHasNoSites( state ) ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/confirm-cancel-domain' );
	}

	const ConfirmCancelDomainWrapper = localize( () => {
		return (
			<PurchasesWrapper title={ titles.confirmCancelDomain }>
				<Main wideLayout className="purchases__cancel-domain confirm-cancel-domain">
					<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
					<ConfirmCancelDomain
						purchaseId={ parseInt( context.params.purchaseId, 10 ) }
						siteSlug={ context.params.site }
					/>
				</Main>
			</PurchasesWrapper>
		);
	} );

	context.primary = <ConfirmCancelDomainWrapper />;
	next();
}

export function list( context, next ) {
	const ListWrapper = localize( () => {
		return (
			<PurchasesWrapper>
				<PurchasesList noticeType={ context.params.noticeType } />
			</PurchasesWrapper>
		);
	} );

	context.primary = <ListWrapper />;
	next();
}

export function managePurchase( context, next ) {
	const ManagePurchasesWrapper = localize( () => {
		const classes = 'manage-purchase';

		return (
			<PurchasesWrapper title={ titles.managePurchase }>
				<Main wideLayout className={ classes }>
					<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
					<PageViewTracker
						path="/me/purchases/:site/:purchaseId"
						title="Purchases > Manage Purchase"
					/>
					<ManagePurchase
						purchaseId={ parseInt( context.params.purchaseId, 10 ) }
						siteSlug={ context.params.site }
					/>
				</Main>
			</PurchasesWrapper>
		);
	} );

	context.primary = <ManagePurchasesWrapper />;
	next();
}

export function addNewPaymentMethod( context, next ) {
	context.primary = <AddNewPaymentMethod />;
	next();
}

export function changePaymentMethod( context, next ) {
	const state = context.store.getState();

	if ( userHasNoSites( state ) ) {
		return noSites( context, '/me/purchases/:site/:purchaseId/payment-method/change/:cardId' );
	}

	const ChangePaymentMethodWrapper = localize( () => {
		return (
			<PurchasesWrapper title={ titles.changePaymentMethod }>
				<Main wideLayout className="purchases__edit-payment-method">
					<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
					<ChangePaymentMethod
						purchaseId={ parseInt( context.params.purchaseId, 10 ) }
						siteSlug={ context.params.site }
						getManagePurchaseUrlFor={ managePurchaseUrl }
						purchaseListUrl={ purchasesRoot }
						isFullWidth={ true }
					/>
				</Main>
			</PurchasesWrapper>
		);
	} );

	context.primary = <ChangePaymentMethodWrapper />;
	next();
}
