import config from '@automattic/calypso-config';
import { localize, useTranslate } from 'i18n-calypso';
import page from 'page';
import { Fragment, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import { makeLayout, render as clientRender } from 'calypso/controller';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import AddNewPaymentMethod from 'calypso/me/purchases/add-new-payment-method';
import ChangePaymentMethod from 'calypso/me/purchases/manage-purchase/change-payment-method';
import {
	managePurchase as managePurchaseUrl,
	purchasesRoot,
	vatDetails as vatDetailsPath,
	billingHistory,
} from 'calypso/me/purchases/paths';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { logToLogstash } from 'calypso/state/logstash/actions';
import CancelPurchase from './cancel-purchase';
import ConfirmCancelDomain from './confirm-cancel-domain';
import ManagePurchase from './manage-purchase';
import MePurchasesErrorBoundary from './me-purchases-error-boundary';
import PurchasesList from './purchases-list';
import titles from './titles';
import VatInfoPage from './vat-info';

function useLogPurchasesError( message ) {
	const reduxDispatch = useDispatch();

	return useCallback(
		( error ) => {
			reduxDispatch(
				logToLogstash( {
					feature: 'calypso_client',
					message,
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					extra: {
						env: config( 'env_id' ),
						type: 'account_level_purchases',
						message: String( error ),
					},
				} )
			);
		},
		[ reduxDispatch, message ]
	);
}

const PurchasesWrapper = ( { title = null, children } ) => {
	return (
		<Fragment>
			<DocumentHead title={ title } />
			{ children }
		</Fragment>
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

export function vatDetails( context, next ) {
	const VatInfoWrapper = localize( () => {
		const goToBillingHistory = () => page( billingHistory );
		const classes = 'vat-details';

		return (
			<PurchasesWrapper title={ titles.vatDetails }>
				<Main wideLayout className={ classes }>
					<PageViewTracker path={ vatDetailsPath } title="Purchases > VAT Details" />

					<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
					<HeaderCake onClick={ goToBillingHistory }>{ titles.vatDetails }</HeaderCake>

					<VatInfoPage siteSlug={ context.params.site } />
				</Main>
			</PurchasesWrapper>
		);
	} );

	context.primary = <VatInfoWrapper />;
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

	const ChangePaymentMethodWrapper = () => {
		const translate = useTranslate();
		const logPurchasesError = useLogPurchasesError(
			'account level purchases change payment method load error'
		);
		return (
			<PurchasesWrapper title={ titles.changePaymentMethod }>
				<Main wideLayout className="purchases__edit-payment-method">
					<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
					<MePurchasesErrorBoundary
						errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
						onError={ logPurchasesError }
					>
						<ChangePaymentMethod
							purchaseId={ parseInt( context.params.purchaseId, 10 ) }
							siteSlug={ context.params.site }
							getManagePurchaseUrlFor={ managePurchaseUrl }
							purchaseListUrl={ purchasesRoot }
						/>
					</MePurchasesErrorBoundary>
				</Main>
			</PurchasesWrapper>
		);
	};

	context.primary = <ChangePaymentMethodWrapper />;
	next();
}
