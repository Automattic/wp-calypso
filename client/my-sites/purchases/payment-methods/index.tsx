import config from '@automattic/calypso-config';
import {
	StripeHookProvider,
	StripeSetupIntentIdProvider,
	useStripe,
} from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useMemo, useEffect } from 'react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { logToLogstash } from 'calypso/lib/logstash';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import PaymentMethodLoader from 'calypso/me/purchases/components/payment-method-loader';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import PaymentMethodSelector from 'calypso/me/purchases/manage-purchase/payment-method-selector';
import PaymentMethodList from 'calypso/me/purchases/payment-methods/payment-method-list';
import titles from 'calypso/me/purchases/titles';
import { useCreateCreditCard } from 'calypso/my-sites/checkout/composite-checkout/hooks/use-create-payment-methods';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import MySitesSidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { getAddNewPaymentMethodUrlFor, getPaymentMethodsUrlFor } from '../paths';

function useLogPaymentMethodsError( message: string ) {
	return useCallback(
		( error ) => {
			logToLogstash( {
				feature: 'calypso_client',
				message,
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				extra: {
					env: config( 'env_id' ),
					type: 'site_level_payment_methods',
					message: String( error ),
				},
			} );
		},
		[ message ]
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
			{ ! isJetpackCloud() && (
				<FormattedHeader
					brandFont
					className="payment-methods__page-heading"
					headerText={ titles.sectionTitle }
					subHeaderText={ translate(
						'Add or delete payment methods for your account. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="payment_methods" showIcon={ false } />
								),
							},
						}
					) }
					align="left"
				/>
			) }
			<PurchasesNavigation sectionTitle={ 'Payment Methods' } siteSlug={ siteSlug } />

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPaymentMethodsError }
			>
				<PaymentMethodList addPaymentMethodUrl={ getAddNewPaymentMethodUrlFor( siteSlug ) } />
			</CheckoutErrorBoundary>
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
		activePayButtonText: String( translate( 'Save card' ) ),
		allowUseForAllSubscriptions: true,
		initialUseForAllSubscriptions: true,
	} );
	const paymentMethodList = useMemo( () => [ stripeMethod ].filter( isValueTruthy ), [
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
			<PageViewTracker
				path={ '/purchases/add-payment-method' }
				title={ String( titles.addPaymentMethod ) }
			/>
			<DocumentHead title={ titles.addPaymentMethod } />
			{ ! isJetpackCloud() && (
				<FormattedHeader
					brandFont
					className="payment-methods__page-heading"
					headerText={ titles.sectionTitle }
					align="left"
				/>
			) }

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPaymentMethodsError }
			>
				<HeaderCake onClick={ goToBillingHistory }>{ titles.addPaymentMethod }</HeaderCake>
				<Layout>
					<Column type="main">
						<PaymentMethodSelector
							paymentMethods={ paymentMethodList }
							successCallback={ goToBillingHistory }
							eventContext={ '/purchases/add-payment-method' }
						/>
					</Column>
					<Column type="sidebar">
						<PaymentMethodSidebar />
					</Column>
				</Layout>
			</CheckoutErrorBoundary>
		</Main>
	);
}
/* eslint-enable wpcalypso/jsx-classname-namespace */

export function SiteLevelAddNewPaymentMethod(
	props: React.ComponentPropsWithoutRef< typeof SiteLevelAddNewPaymentMethodForm >
): JSX.Element {
	const locale = useSelector( getCurrentUserLocale );
	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ getStripeConfiguration }>
			<StripeSetupIntentIdProvider fetchStipeSetupIntentId={ getStripeConfiguration }>
				<SiteLevelAddNewPaymentMethodForm { ...props } />
			</StripeSetupIntentIdProvider>
		</StripeHookProvider>
	);
}
