/**
 * External dependencies
 */
import React, { ReactElement, useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { useTranslate } from 'i18n-calypso';
import {
	CheckoutProvider,
	CheckoutPaymentMethods,
	CheckoutSubmitButton,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { Card } from '@automattic/components';
import { useCreateStoredCreditCard } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/hooks/use-create-stored-credit-card';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import getPaymentMethodIdFromPayment from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/get-payment-method-id-from-payment';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { assignNewCardProcessor } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/assignment-processor-functions';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';
import type { PaymentMethod } from '@automattic/composite-checkout';
import QueryPaymentCountries from 'calypso/components/data/query-countries/payments';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';

function onPaymentSelectComplete( {
	successCallback,
	translate,
	showSuccessMessage,
	purchase,
}: {
	successCallback: () => void;
	translate: ReturnType< typeof useTranslate >;
	showSuccessMessage: ( message: string | TranslateResult ) => void;
	purchase?: Purchase | undefined;
} ) {
	if ( purchase ) {
		showSuccessMessage( translate( 'Your payment method has been set.' ) );
	} else {
		showSuccessMessage( translate( 'Your payment method has been added successfully.' ) );
	}
	successCallback();
}

function CurrentPaymentMethodNotAvailableNotice( {
	purchase,
}: {
	purchase: Purchase;
} ): JSX.Element | null {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const storedPaymentAgreements = useSelector( getStoredPaymentAgreements );
	const noticeProps: Record< string, boolean | string | number | TranslateResult > = {
		showDismiss: false,
	};

	if ( purchase.payment.creditCard && creditCardHasAlreadyExpired( purchase ) ) {
		noticeProps.text = translate(
			'Your %(cardType)s ending in %(cardNumber)d expired %(cardExpiry)s.',
			{
				args: {
					cardType: purchase.payment.creditCard.type.toUpperCase(),
					cardNumber: parseInt( purchase.payment.creditCard.number, 10 ),
					cardExpiry: moment( purchase.payment.creditCard.expiryDate, 'MM/YY' ).format(
						'MMMM YYYY'
					),
				},
			}
		);
		return <Notice { ...noticeProps } />;
	}

	if ( getPaymentMethodIdFromPayment( purchase.payment ) === 'paypal-existing' ) {
		const storedPaymentAgreement = storedPaymentAgreements.find(
			( agreement ) => agreement.stored_details_id === purchase.payment.storedDetailsId
		);
		if ( storedPaymentAgreement?.email ) {
			noticeProps.text = translate(
				'This purchase is currently billed to your PayPal account (%(emailAddress)s).',
				{
					args: {
						emailAddress: storedPaymentAgreement.email,
					},
				}
			);
			return <Notice { ...noticeProps } />;
		}

		noticeProps.text = translate( 'This purchase is currently billed to your PayPal account.' );
		return <Notice { ...noticeProps } />;
	}

	return null;
}

function AllSubscriptionsEffectWarning( {
	useForAllSubscriptions,
}: {
	useForAllSubscriptions: boolean;
} ) {
	const translate = useTranslate();

	if ( useForAllSubscriptions ) {
		return (
			<span className="payment-method-add__all-subscriptions-effect-warning">
				{ translate( 'This card will be used for future renewals of existing purchases.' ) }
			</span>
		);
	}
	return (
		<span className="payment-method-add__all-subscriptions-effect-warning">
			{ translate(
				'This card will not be assigned to any subscriptions. You can assign it to a subscription from the subscription page.'
			) }
		</span>
	);
}

function PaymentMethodAdd(): ReactElement {
	const purchase = undefined;
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();

	const stripeMethod = useCreateStoredCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		shouldUseEbanx: false,
		shouldShowTaxFields: true,
		activePayButtonText: translate( 'Save card' ),
	} );
	const paymentMethods = useMemo( () => [ stripeMethod ].filter( Boolean ), [ stripeMethod ] );

	useEffect( () => {
		if ( stripeLoadingError ) {
			reduxDispatch( errorNotice( stripeLoadingError.message ) );
		}
	}, [ stripeLoadingError, reduxDispatch ] );

	const goToPaymentMethods = () => page( '/partner-portal/payment-method/' );

	const currentlyAssignedPaymentMethodId = getPaymentMethodIdFromPayment( purchase?.payment );

	const showSuccessMessage = useCallback(
		( message ) => {
			reduxDispatch( successNotice( message, { displayOnNextPage: true, duration: 5000 } ) );
		},
		[ reduxDispatch ]
	);

	const showErrorMessage = useCallback(
		( error ) => {
			const message = error?.toString ? error.toString() : error;
			reduxDispatch( errorNotice( message, { displayOnNextPage: true } ) );
		},
		[ reduxDispatch ]
	);

	const showInfoMessage = useCallback(
		( message ) => {
			reduxDispatch( infoNotice( message ) );
		},
		[ reduxDispatch ]
	);

	const currentPaymentMethodNotAvailable = ! paymentMethods.some(
		( paymentMethod ) => paymentMethod.id === currentlyAssignedPaymentMethodId
	);

	const [ useForAllSubscriptions, setUseForAllSubscriptions ] = useState< boolean >( ! purchase );

	const assignAllSubscriptionsText = String(
		translate( 'Assign this payment method to all of my subscriptions' )
	);

	if ( paymentMethods.length === 0 ) {
		return <div>{ translate( 'loading...' ) }</div>;
	}

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
						purchase,
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
								purchase,
								useForAllSubscriptions,
								translate,
								stripe,
								stripeConfiguration,
								reduxDispatch,
							},
							data
						),
				} }
				isLoading={ isStripeLoading }
				initiallySelectedPaymentMethodId="card"
			>
				<Card className="payment-method-add__content">
					<QueryPaymentCountries />
					{ currentPaymentMethodNotAvailable && purchase && (
						<CurrentPaymentMethodNotAvailableNotice purchase={ purchase } />
					) }

					{ paymentMethods && paymentMethods[ 0 ] && paymentMethods[ 0 ].activeContent }

					{ ! purchase && (
						<FormLabel className="payment-method-add__all-subscriptions-checkbox-label">
							<FormInputCheckbox
								className="payment-method-add__all-subscriptions-checkbox"
								checked={ useForAllSubscriptions }
								onChange={ () => setUseForAllSubscriptions( ( checked ) => ! checked ) }
								aria-label={ assignAllSubscriptionsText }
							/>
							{ assignAllSubscriptionsText }
							<AllSubscriptionsEffectWarning useForAllSubscriptions={ useForAllSubscriptions } />
						</FormLabel>
					) }

					<CheckoutSubmitButton />
				</Card>
			</CheckoutProvider>
		</Main>
	);
}

export default function PaymentMethodAddWrapper( props ) {
	const locale = useSelector( getCurrentUserLocale );

	return (
		<StripeHookProvider
			locale={ locale }
			configurationArgs={ { needs_intent: true } }
			fetchStripeConfiguration={ getStripeConfiguration }
		>
			<PaymentMethodAdd { ...props } />
		</StripeHookProvider>
	);
}
