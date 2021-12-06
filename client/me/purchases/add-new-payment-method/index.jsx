import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import PaymentMethodLoader from 'calypso/me/purchases/components/payment-method-loader';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import PaymentMethodSelector from 'calypso/me/purchases/manage-purchase/payment-method-selector';
import { paymentMethods } from 'calypso/me/purchases/paths';
import titles from 'calypso/me/purchases/titles';
import { useCreateCreditCard } from 'calypso/my-sites/checkout/composite-checkout/hooks/use-create-payment-methods';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';

function AddNewPaymentMethod() {
	const goToPaymentMethods = () => page( paymentMethods );
	const addPaymentMethodTitle = titles.addPaymentMethod;

	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();
	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		shouldUseEbanx: false,
		shouldShowTaxFields: true,
		activePayButtonText: translate( 'Save card' ),
		allowUseForAllSubscriptions: true,
		initialUseForAllSubscriptions: true,
	} );
	const paymentMethodList = useMemo( () => [ stripeMethod ].filter( Boolean ), [ stripeMethod ] );
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

			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<HeaderCake onClick={ goToPaymentMethods }>{ addPaymentMethodTitle }</HeaderCake>

			<Layout>
				<Column type="main">
					<PaymentMethodSelector
						paymentMethods={ paymentMethodList }
						successCallback={ goToPaymentMethods }
						eventContext={ '/me/purchases/add-payment-method' }
					/>
				</Column>
				<Column type="sidebar">
					<PaymentMethodSidebar />
				</Column>
			</Layout>
		</Main>
	);
}

export default function AccountLevelAddNewPaymentMethodWrapper( props ) {
	const locale = useSelector( getCurrentUserLocale );
	return (
		<StripeHookProvider
			locale={ locale }
			configurationArgs={ { needs_intent: true } }
			fetchStripeConfiguration={ getStripeConfiguration }
		>
			<AddNewPaymentMethod { ...props } />
		</StripeHookProvider>
	);
}
