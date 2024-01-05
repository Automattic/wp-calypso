import page from '@automattic/calypso-router';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import PaymentMethodLoader from 'calypso/me/purchases/components/payment-method-loader';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import PaymentMethodSelector from 'calypso/me/purchases/manage-purchase/payment-method-selector';
import { paymentMethods } from 'calypso/me/purchases/paths';
import titles from 'calypso/me/purchases/titles';
import { useCreateCreditCard } from 'calypso/my-sites/checkout/src/hooks/use-create-payment-methods';
import { useSelector, useDispatch } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { PaymentMethodSelectorSubmitButtonContent } from '../manage-purchase/payment-method-selector/payment-method-selector-submit-button-content';

function AddNewPaymentMethod() {
	const goToPaymentMethods = () => page( paymentMethods );
	const addPaymentMethodTitle = String( titles.addPaymentMethod );

	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError } = useStripe();
	const stripeMethod = useCreateCreditCard( {
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
		() => ( stripeMethod ? [ stripeMethod ] : [] ),
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

export default function AccountLevelAddNewPaymentMethodWrapper() {
	const locale = useSelector( getCurrentUserLocale );
	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ getStripeConfiguration }>
			<AddNewPaymentMethod />
		</StripeHookProvider>
	);
}
