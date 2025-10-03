import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import page from '@automattic/calypso-router';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProducts from 'calypso/components/data/query-products-list';
import HeaderCake from 'calypso/components/header-cake';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getRazorpayConfiguration, getStripeConfiguration } from 'calypso/lib/store-transactions';
import PaymentMethodLoader from 'calypso/me/purchases/components/payment-method-loader';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import PaymentMethodSelector from 'calypso/me/purchases/manage-purchase/payment-method-selector';
import { paymentMethods } from 'calypso/me/purchases/paths';
import titles from 'calypso/me/purchases/titles';
import { useCreateCreditCard } from 'calypso/my-sites/checkout/src/hooks/use-create-payment-methods';
import { useSelector, useDispatch } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { PaymentMethodSelectorSubmitButtonContent } from '../manage-purchase/payment-method-selector/payment-method-selector-submit-button-content';

function AddNewPaymentMethod( { purchaseListUrl }: { purchaseListUrl?: string | undefined } ) {
	const goToPaymentMethods = () => {
		page( purchaseListUrl ?? paymentMethods );
	};
	const addPaymentMethodTitle = String( titles.addPaymentMethod );
	const currency = useSelector( getCurrentUserCurrencyCode );
	const translate = useTranslate();
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
		return <PaymentMethodLoader title={ addPaymentMethodTitle } />;
	}

	const title = `${ titles.activeUpgrades } › ${ addPaymentMethodTitle }`;

	return (
		<Main wideLayout className="add-new-payment-method">
			<PageViewTracker path="/me/purchases/add-payment-method" title={ title } />
			<DocumentHead title={ title } />

			<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />

			<HeaderCake onClick={ goToPaymentMethods }>{ addPaymentMethodTitle }</HeaderCake>

			<Layout>
				<Column type="main">
					<PaymentMethodSelector
						paymentMethods={ paymentMethodList }
						successCallback={ goToPaymentMethods }
						eventContext="/me/purchases/add-payment-method"
					/>
				</Column>
				<Column type="sidebar">
					<PaymentMethodSidebar />
				</Column>
			</Layout>
		</Main>
	);
}

export default function AccountLevelAddNewPaymentMethodWrapper( {
	purchaseListUrl,
}: {
	purchaseListUrl?: string | undefined;
} ) {
	const locale = useSelector( getCurrentUserLocale );

	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ getStripeConfiguration }>
			<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
				{
					// QueryProducts added to ensure currency-code state gets populated for usage of getCurrentUserCurrencyCode
					// Returning a couple of standard products to speed up the render time and ensure redundancy
					// We only need one to get the currency code into state
				 }
				<QueryProducts
					productSlugList={ [ 'value_bundle', 'personal-bundle', 'business-bundle' ] }
				/>
				<AddNewPaymentMethod purchaseListUrl={ purchaseListUrl } />
			</RazorpayHookProvider>
		</StripeHookProvider>
	);
}
