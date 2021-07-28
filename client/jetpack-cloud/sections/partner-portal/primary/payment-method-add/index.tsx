/**
 * External dependencies
 */
import React, { ReactElement, useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { useTranslate } from 'i18n-calypso';
import { CheckoutProvider, CheckoutSubmitButton } from '@automattic/composite-checkout';
import { Button, Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { useCreateStoredCreditCardMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/hooks/use-create-stored-credit-card';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getAllStoredCards } from 'calypso/state/stored-cards/selectors';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import {
	assignNewCardProcessor,
	NewCardSubmitData,
} from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/assignment-processor-functions';
import type { TranslateResult } from 'i18n-calypso';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import CreditCardLoading from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/credit-card-loading';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

function onPaymentSelectComplete( {
	successCallback,
	translate,
	showSuccessMessage,
}: {
	successCallback: () => void;
	translate: ReturnType< typeof useTranslate >;
	showSuccessMessage: ( message: string | TranslateResult ) => void;
} ) {
	showSuccessMessage( translate( 'Your payment method has been added successfully.' ) );
	successCallback();
}

function PaymentMethodAdd(): ReactElement {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const storedCards = useSelector( getAllStoredCards );
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();

	const stripeMethod = useCreateStoredCreditCardMethod( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		activePayButtonText: translate( 'Save payment method' ) as string,
	} );
	const paymentMethods = useMemo( () => [ stripeMethod ].filter( Boolean ), [ stripeMethod ] );

	useEffect( () => {
		if ( stripeLoadingError ) {
			dispatch( errorNotice( stripeLoadingError.message ) );
		}
	}, [ stripeLoadingError, dispatch ] );

	const onGoToPaymentMethods = () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_payment_method_card_go_back_click' ) );
	};

	const showSuccessMessage = useCallback(
		( message ) => {
			dispatch( successNotice( message, { displayOnNextPage: true, duration: 5000 } ) );
		},
		[ dispatch ]
	);

	const showErrorMessage = useCallback(
		( error ) => {
			const message = error?.toString ? error.toString() : error;
			dispatch( errorNotice( message, { displayOnNextPage: true } ) );
		},
		[ dispatch ]
	);

	const showInfoMessage = useCallback(
		( message ) => {
			dispatch( infoNotice( message ) );
		},
		[ dispatch ]
	);

	const [ useAsPrimaryPaymentMethod, setUseAsPrimaryPaymentMethod ] = useState< boolean >(
		0 === storedCards.length
	);

	const assignAllSubscriptionsText = String( translate( 'Set as primary payment method' ) );

	return (
		<Main wideLayout className="payment-method-add">
			<DocumentHead title={ translate( 'Payment Method' ) } />
			<SidebarNavigation />

			<div className="payment-method-add__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Method' ) }</CardHeading>
			</div>

			<CheckoutProvider
				onPaymentComplete={ () =>
					onPaymentSelectComplete( {
						successCallback: () => page( '/partner-portal/payment-method/' ),
						translate,
						showSuccessMessage,
					} )
				}
				showErrorMessage={ showErrorMessage }
				showInfoMessage={ showInfoMessage }
				showSuccessMessage={ showSuccessMessage }
				paymentMethods={ paymentMethods }
				paymentProcessors={ {
					card: ( data ) =>
						assignNewCardProcessor(
							{
								useAsPrimaryPaymentMethod,
								translate,
								stripe,
								stripeConfiguration,
								dispatch,
							},
							data as NewCardSubmitData
						),
				} }
				isLoading={ isStripeLoading }
				initiallySelectedPaymentMethodId="card"
			>
				<Card className="payment-method-add__content">
					<CardHeading>{ translate( 'Credit card details' ) }</CardHeading>

					{ 0 === paymentMethods.length && <CreditCardLoading /> }

					{ paymentMethods && paymentMethods[ 0 ] && paymentMethods[ 0 ].activeContent }

					{ storedCards.length > 0 && (
						<FormLabel className="payment-method-add__all-subscriptions-checkbox-label">
							<FormInputCheckbox
								className="payment-method-add__all-subscriptions-checkbox"
								checked={ useAsPrimaryPaymentMethod }
								onChange={ () => setUseAsPrimaryPaymentMethod( ( checked ) => ! checked ) }
								aria-label={ assignAllSubscriptionsText }
							/>
							<span>{ assignAllSubscriptionsText }</span>
						</FormLabel>
					) }

					<div className="payment-method-add__navigation-buttons">
						<Button
							className="payment-method-add__back-button"
							href="/partner-portal/payment-method/"
							disabled={ isStripeLoading }
							onClick={ onGoToPaymentMethods }
						>
							{ translate( 'Go back' ) }
						</Button>
						<CheckoutSubmitButton className="payment-method-add__submit-button" />
					</div>
				</Card>
			</CheckoutProvider>
		</Main>
	);
}

export default function PaymentMethodAddWrapper(): ReactElement {
	const locale = useSelector( getCurrentUserLocale );

	return (
		<StripeHookProvider
			locale={ locale }
			configurationArgs={ { needs_intent: true } }
			fetchStripeConfiguration={ getStripeConfiguration }
		>
			<PaymentMethodAdd />
		</StripeHookProvider>
	);
}
