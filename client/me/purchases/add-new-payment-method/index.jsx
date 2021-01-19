/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import page from 'page';
import React, { useMemo } from 'react';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { concatTitle } from 'calypso/lib/react-helpers';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import titles from 'calypso/me/purchases/titles';
import { paymentMethods } from 'calypso/me/purchases/paths';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import { isEnabled } from 'calypso/config';
import PaymentMethodSelector from '../payment-method-selector';
import { useCreateCreditCard } from 'calypso/my-sites/checkout/composite-checkout/use-create-payment-methods';

function AddNewPaymentMethod() {
	const goToPaymentMethods = () => page( paymentMethods );
	const addPaymentMethodTitle = isEnabled( 'purchases/new-payment-methods' )
		? titles.addPaymentMethod
		: titles.addCreditCard;

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
	} );
	const paymentMethodList = useMemo( () => [ stripeMethod ], [ stripeMethod ] );

	return (
		<Main className="add-new-payment-method is-wide-layout">
			<PageViewTracker
				path={
					isEnabled( 'purchases/new-payment-methods' )
						? '/me/purchases/add-payment-method'
						: '/me/purchases/add-credit-card'
				}
				title={ concatTitle( titles.purchases, addPaymentMethodTitle ) }
			/>
			<DocumentHead title={ concatTitle( titles.purchases, addPaymentMethodTitle ) } />

			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<HeaderCake onClick={ goToPaymentMethods }>{ addPaymentMethodTitle }</HeaderCake>

			<Layout>
				<Column type="main">
					<PaymentMethodSelector
						paymentMethods={ paymentMethodList }
						successCallback={ goToPaymentMethods }
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
