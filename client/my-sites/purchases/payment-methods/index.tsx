import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import page from '@automattic/calypso-router';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getRazorpayConfiguration, getStripeConfiguration } from 'calypso/lib/store-transactions';
import PaymentMethodLoader from 'calypso/me/purchases/components/payment-method-loader';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import PaymentMethodSelector from 'calypso/me/purchases/manage-purchase/payment-method-selector';
import { PaymentMethodSelectorSubmitButtonContent } from 'calypso/me/purchases/manage-purchase/payment-method-selector/payment-method-selector-submit-button-content';
import PaymentMethodList from 'calypso/me/purchases/payment-methods/payment-method-list';
import titles from 'calypso/me/purchases/titles';
import { useCreateCreditCard } from 'calypso/my-sites/checkout/src/hooks/use-create-payment-methods';
import { logStashLoadErrorEvent } from 'calypso/my-sites/checkout/src/lib/analytics';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getAddNewPaymentMethodUrlFor, getPaymentMethodsUrlFor } from '../paths';

function useLogPaymentMethodsError( message: string ) {
	return useCallback(
		( error: Error ) => {
			logStashLoadErrorEvent( 'site_level_payment_methods', error, { message } );
		},
		[ message ]
	);
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export function PaymentMethods( { siteSlug }: { siteSlug: string } ) {
	const translate = useTranslate();
	const logPaymentMethodsError = useLogPaymentMethodsError(
		'site level payment methods load error'
	);
	const siteId = useSelector( getSelectedSiteId );

	return (
		<Main wideLayout className="purchases">
			{ isJetpackCloud() && <SidebarNavigation /> }
			<DocumentHead title={ titles.paymentMethods } />
			<PageViewTracker path="/purchases/payment-methods" title="Payment Methods" />
			<QuerySitePurchases siteId={ siteId } />
			{ ! isJetpackCloud() && (
				<NavigationHeader
					title={ titles.sectionTitle }
					subtitle={ translate(
						'Add or delete payment methods for your account. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="payment_methods" showIcon={ false } />
								),
							},
						}
					) }
				/>
			) }
			<PurchasesNavigation section="paymentMethods" siteSlug={ siteSlug } />

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPaymentMethodsError }
			>
				<PaymentMethodList addPaymentMethodUrl={ getAddNewPaymentMethodUrlFor( siteSlug ) } />
			</CheckoutErrorBoundary>
		</Main>
	);
}

function SiteLevelAddNewPaymentMethodForm( { siteSlug }: { siteSlug: string } ) {
	const translate = useTranslate();
	const goToBillingHistory = () => page( getPaymentMethodsUrlFor( siteSlug ) );
	const logPaymentMethodsError = useLogPaymentMethodsError(
		'site level add new payment method load error'
	);
	const currency = useSelector( getCurrentUserCurrencyCode );

	const { isStripeLoading, stripeLoadingError } = useStripe();
	const stripeMethod = useCreateCreditCard( {
		currency,
		isStripeLoading,
		stripeLoadingError,
		shouldUseEbanx: false,
		shouldShowTaxFields: true,
		submitButtonContent: (
			<PaymentMethodSelectorSubmitButtonContent text={ translate( 'Save card' ) } />
		),
		allowUseForAllSubscriptions: true,
		initialUseForAllSubscriptions: true,
	} );
	const paymentMethodList = useMemo(
		() => [ stripeMethod ].filter( isValueTruthy ),
		[ stripeMethod ]
	);
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
			{ isJetpackCloud() && <SidebarNavigation /> }
			<PageViewTracker
				path="/purchases/add-payment-method"
				title={ String( titles.addPaymentMethod ) }
			/>
			<DocumentHead title={ titles.addPaymentMethod } />
			{ ! isJetpackCloud() && <NavigationHeader title={ titles.sectionTitle } /> }

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
							eventContext="/purchases/add-payment-method"
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

export function SiteLevelAddNewPaymentMethod( props: { siteSlug: string } ) {
	const locale = useSelector( getCurrentUserLocale );
	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ getStripeConfiguration }>
			<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
				<SiteLevelAddNewPaymentMethodForm { ...props } />
			</RazorpayHookProvider>
		</StripeHookProvider>
	);
}
