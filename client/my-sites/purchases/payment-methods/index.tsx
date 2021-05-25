/**
 * External dependencies
 */
import React, { useCallback, useMemo, useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import page from 'page';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import { errorNotice } from 'calypso/state/notices/actions';
import MySitesSidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FormattedHeader from 'calypso/components/formatted-header';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import PaymentMethodList from 'calypso/me/purchases/payment-methods/payment-method-list';
import HeaderCake from 'calypso/components/header-cake';
import { getAddNewPaymentMethodUrlFor, getPaymentMethodsUrlFor } from '../paths';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import titles from 'calypso/me/purchases/titles';
import SiteLevelPurchasesErrorBoundary from 'calypso/my-sites/purchases/site-level-purchases-error-boundary';
import { logToLogstash } from 'calypso/state/logstash/actions';
import config from '@automattic/calypso-config';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import PaymentMethodSelector from 'calypso/me/purchases/manage-purchase/payment-method-selector';
import { useCreateCreditCard } from 'calypso/my-sites/checkout/composite-checkout/hooks/use-create-payment-methods';
import PaymentMethodLoader from 'calypso/me/purchases/components/payment-method-loader';
import doesValueExist from 'calypso/my-sites/checkout/composite-checkout/lib/does-value-exist';

function useLogPaymentMethodsError( message: string ) {
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
						type: 'site_level_payment_methods',
						message: String( error ),
					},
				} )
			);
		},
		[ reduxDispatch, message ]
	);
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export function PaymentMethods( { siteSlug }: { siteSlug: string } ): JSX.Element {
	const translate = useTranslate();
	const logPaymentMethodsError = useLogPaymentMethodsError(
		'site level payment methods load error'
	);

	return (
		<Main wideLayout className="purchases">
			<MySitesSidebarNavigation />
			<DocumentHead title={ titles.paymentMethods } />
			<PageViewTracker path="/purchases/payment-methods" title="Payment Methods" />
			<FormattedHeader
				brandFont
				className="payment-methods__page-heading"
				headerText={ titles.sectionTitle }
				align="left"
			/>
			<PurchasesNavigation sectionTitle={ 'Payment Methods' } siteSlug={ siteSlug } />

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPaymentMethodsError }
			>
				<PaymentMethodList addPaymentMethodUrl={ getAddNewPaymentMethodUrlFor( siteSlug ) } />
			</SiteLevelPurchasesErrorBoundary>
		</Main>
	);
}

function SiteLevelAddNewPaymentMethodForm( { siteSlug }: { siteSlug: string } ): JSX.Element {
	const translate = useTranslate();
	const goToBillingHistory = () => page( getPaymentMethodsUrlFor( siteSlug ) );
	const logPaymentMethodsError = useLogPaymentMethodsError(
		'site level add new payment method load error'
	);

	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();
	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		shouldUseEbanx: false,
		shouldShowTaxFields: true,
		activePayButtonText: translate( 'Save card' ),
	} );
	const paymentMethodList = useMemo( () => [ stripeMethod ].filter( doesValueExist ), [
		stripeMethod,
	] );
	const reduxDispatch = useDispatch();
	useEffect( () => {
		if ( stripeLoadingError ) {
			reduxDispatch( errorNotice( stripeLoadingError.message ) );
		}
	}, [ stripeLoadingError, reduxDispatch ] );

	if ( paymentMethodList.length === 0 ) {
		return <PaymentMethodLoader title={ String( titles.addPaymentMethod ) } />;
	}

	return (
		<Main wideLayout className="purchases">
			<MySitesSidebarNavigation />
			<PageViewTracker path={ '/purchases/add-payment-method' } title={ titles.addPaymentMethod } />
			<DocumentHead title={ titles.addPaymentMethod } />
			<FormattedHeader
				brandFont
				className="payment-methods__page-heading"
				headerText={ titles.sectionTitle }
				align="left"
			/>

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPaymentMethodsError }
			>
				<HeaderCake onClick={ goToBillingHistory }>{ titles.addPaymentMethod }</HeaderCake>
				<Layout>
					<Column type="main">
						<PaymentMethodSelector
							paymentMethods={ paymentMethodList }
							successCallback={ goToBillingHistory }
						/>
					</Column>
					<Column type="sidebar">
						<PaymentMethodSidebar />
					</Column>
				</Layout>
			</SiteLevelPurchasesErrorBoundary>
		</Main>
	);
}
/* eslint-enable wpcalypso/jsx-classname-namespace */

export function SiteLevelAddNewPaymentMethod(
	props: React.ComponentPropsWithoutRef< typeof SiteLevelAddNewPaymentMethodForm >
): JSX.Element {
	const locale = useSelector( getCurrentUserLocale );
	return (
		<StripeHookProvider
			locale={ locale }
			configurationArgs={ { needs_intent: true } }
			fetchStripeConfiguration={ getStripeConfiguration }
		>
			<SiteLevelAddNewPaymentMethodForm { ...props } />
		</StripeHookProvider>
	);
}
