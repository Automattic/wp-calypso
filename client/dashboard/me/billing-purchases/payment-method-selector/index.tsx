import { SubscriptionBillPeriod } from '@automattic/api-core';
import {
	assignPaymentMethodMutation,
	createPayPalAgreementMutation,
	createStripeSetupIntentMutation,
	saveCreditCardMutation,
	updateCreditCardMutation,
	userPaymentMethodsQuery,
} from '@automattic/api-queries';
import { useStripe } from '@automattic/calypso-stripe';
import {
	CheckoutProvider,
	CheckoutPaymentMethods,
	CheckoutFormSubmit,
} from '@automattic/composite-checkout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import clsx from 'clsx';
import { useCallback, useRef } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardBody } from '../../../components/card';
import { Notice } from '../../../components/notice';
import { creditCardHasAlreadyExpired, isAkismetProduct } from '../../../utils/purchase';
import {
	assignExistingCardProcessor,
	assignPayPalProcessor,
	assignExistingPayPalPPCPProcessor,
	assignNewCardProcessor,
} from '../payment-methods';
import getPaymentMethodIdFromPayment from './get-payment-method-id-from-payment';
import TosText from './tos-text';
import type { Purchase } from '@automattic/api-core';
import type { PaymentMethod, PaymentProcessorProp } from '@automattic/composite-checkout';

/**
 * Adding a payment method and reassigning one to an existing subscription are
 * different user intents that happen to share this component, so they get
 * distinct events rather than one event with a flag.
 */
function getEventNames( isPurchaseAssignment: boolean ) {
	return isPurchaseAssignment
		? {
				success: 'calypso_dashboard_purchase_payment_method_change',
				failure: 'calypso_dashboard_purchase_payment_method_change_failure',
		  }
		: {
				success: 'calypso_dashboard_payment_method_add',
				failure: 'calypso_dashboard_payment_method_add_failure',
		  };
}

/**
 * The submit button belongs to composite-checkout, which does not report which
 * payment method was submitted to the provider's completion callbacks. Record it
 * as each processor runs so the outcome events can name it.
 */
function withProcessorTracking(
	processors: PaymentProcessorProp,
	submittedPaymentProcessorId: { current: string }
): PaymentProcessorProp {
	return Object.fromEntries(
		Object.entries( processors ).map( ( [ processorId, processor ] ) => [
			processorId,
			( data: unknown ) => {
				submittedPaymentProcessorId.current = processorId;
				return processor( data );
			},
		] )
	);
}

/**
 * A component to handle assigning payment methods to existing subscriptions.
 * This is quite different than the payment methods step of checkout even
 * though they use many of the same systems.
 */
export function PaymentMethodSelector( {
	purchase,
	paymentMethods,
	successCallback,
}: {
	purchase?: Purchase;
	paymentMethods: PaymentMethod[];
	successCallback: () => void;
} ) {
	const { createSuccessNotice, createErrorNotice, createInfoNotice } = useDispatch( noticesStore );
	const currentlyAssignedPaymentMethodId = getPaymentMethodIdFromPayment( purchase );
	const { stripe, stripeConfiguration } = useStripe();
	const { recordTracksEvent } = useAnalytics();
	const eventNames = getEventNames( Boolean( purchase ) );
	const submittedPaymentProcessorId = useRef( '' );

	const { mutateAsync: assignPaymentMethod } = useMutation( assignPaymentMethodMutation() );
	const { mutateAsync: createPayPalAgreement } = useMutation( createPayPalAgreementMutation() );
	const { mutateAsync: createStripeSetupIntent } = useMutation( createStripeSetupIntentMutation() );
	const { mutateAsync: saveCreditCard } = useMutation( saveCreditCardMutation() );
	const { mutateAsync: updateCreditCard } = useMutation( updateCreditCardMutation() );

	const isAkismetPurchase = purchase ? isAkismetProduct( purchase ) : false;
	const is100YearPlanPurchase =
		purchase?.bill_period_days === SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD;
	const is100YearDomainPurchase = purchase
		? Boolean( purchase.product_slug?.includes( '100-year' ) )
		: false;

	const showRedirectMessage = useCallback( () => {
		createInfoNotice( __( 'Redirecting to payment partner…' ), { type: 'snackbar' } );
	}, [ createInfoNotice ] );

	const handleChangeError = useCallback(
		( {
			transactionError,
			paymentMethodId,
		}: {
			transactionError: string | null;
			paymentMethodId: string | null | undefined;
		} ) => {
			recordTracksEvent( eventNames.failure, {
				payment_processor: submittedPaymentProcessorId.current,
				payment_method_id: paymentMethodId,
				error_message: transactionError,
			} );
			createErrorNotice(
				transactionError ||
					__( 'There was a problem assigning that payment method. Please try again.' ),
				{ type: 'snackbar' }
			);
		},
		[ createErrorNotice, recordTracksEvent, eventNames.failure ]
	);

	const showSuccessMessage = useCallback(
		( message: string ) => {
			createSuccessNotice( message, { type: 'snackbar' } );
		},
		[ createSuccessNotice ]
	);

	const currentPaymentMethodNotAvailable = ! paymentMethods.some(
		( paymentMethod ) => paymentMethod.id === currentlyAssignedPaymentMethodId
	);

	return (
		<CheckoutProvider
			onPaymentComplete={ () => {
				recordTracksEvent( eventNames.success, {
					payment_processor: submittedPaymentProcessorId.current,
				} );
				onPaymentSelectComplete( {
					successCallback,
					showSuccessMessage,
					purchase,
				} );
			} }
			onPaymentRedirect={ showRedirectMessage }
			onPaymentError={ handleChangeError }
			paymentMethods={ paymentMethods }
			paymentProcessors={ withProcessorTracking(
				{
					'existing-card': ( data: unknown ) =>
						assignExistingCardProcessor( purchase, data, assignPaymentMethod ),
					'existing-card-ebanx': ( data: unknown ) =>
						assignExistingCardProcessor( purchase, data, assignPaymentMethod ),
					'existing-paypal-ppcp': ( data: unknown ) =>
						assignExistingPayPalPPCPProcessor( purchase, data, assignPaymentMethod ),
					card: ( data: unknown ) =>
						assignNewCardProcessor(
							{
								purchase,
								stripe,
								stripeConfiguration,
								createStripeSetupIntent,
								saveCreditCard,
								updateCreditCard,
							},
							data
						),
					'paypal-express': ( data: unknown ) =>
						assignPayPalProcessor( purchase, data, createPayPalAgreement ),
				},
				submittedPaymentProcessorId
			) }
			initiallySelectedPaymentMethodId={ getInitiallySelectedPaymentMethodId(
				currentlyAssignedPaymentMethodId,
				paymentMethods
			) }
		>
			<Card className={ clsx( 'payment-method-selector__content' ) }>
				<CardBody>
					<VStack spacing={ 4 }>
						{ currentPaymentMethodNotAvailable && purchase && (
							<CurrentPaymentMethodNotAvailableNotice purchase={ purchase } />
						) }
						<CheckoutPaymentMethods
							className="payment-method-selector__list"
							isComplete={ false }
						/>
						<Text>
							<TosText
								isAkismetPurchase={ isAkismetPurchase }
								is100YearPlanPurchase={ is100YearPlanPurchase }
								is100YearDomainPurchase={ is100YearDomainPurchase }
							/>
						</Text>

						<CheckoutFormSubmit />
					</VStack>
				</CardBody>
			</Card>
		</CheckoutProvider>
	);
}

// We want to preselect the current method if it is in the list, but if not, preselect the first method.
function getInitiallySelectedPaymentMethodId(
	currentlyAssignedPaymentMethodId: string,
	paymentMethods: PaymentMethod[]
) {
	if (
		! paymentMethods.some(
			( paymentMethod ) => paymentMethod.id === currentlyAssignedPaymentMethodId
		)
	) {
		return paymentMethods?.[ 0 ]?.id;
	}

	return currentlyAssignedPaymentMethodId;
}

function onPaymentSelectComplete( {
	successCallback,
	showSuccessMessage,
	purchase,
}: {
	successCallback: () => void;
	showSuccessMessage: ( message: string ) => void;
	purchase?: Purchase | undefined;
} ) {
	if ( purchase ) {
		showSuccessMessage( __( 'Your payment method has been set.' ) );
	} else {
		showSuccessMessage( __( 'Your payment method has been added successfully.' ) );
	}
	successCallback();
}

function CurrentPaymentMethodNotAvailableNotice( { purchase }: { purchase: Purchase } ) {
	const { data: storedPaymentAgreements = [] } = useQuery(
		userPaymentMethodsQuery( { type: 'agreement' } )
	);

	if ( purchase.payment_type === 'credit_card' && creditCardHasAlreadyExpired( purchase ) ) {
		const expiry = purchase.payment_expiry || '';
		const cardType = purchase.payment_card_type?.toUpperCase() || '';
		const cardNumber = purchase.payment_details || '';

		return (
			<Notice variant="info">
				{ sprintf(
					/* translators: %1$s: card type, %2$s: last 4 digits of card, %3$s: expiry date */
					__( 'Your %1$s ending in %2$s expired %3$s.' ),
					cardType,
					cardNumber,
					expiry
				) }
			</Notice>
		);
	}

	if ( getPaymentMethodIdFromPayment( purchase ) === 'paypal-existing' ) {
		const storedPaymentAgreement = storedPaymentAgreements.find(
			( agreement ) => agreement.stored_details_id === purchase.stored_details_id
		);
		if ( storedPaymentAgreement?.email ) {
			return (
				<Notice variant="info">
					{ sprintf(
						/* translators: %s: PayPal email address */
						__( 'This purchase is currently billed to your PayPal account (%s).' ),
						storedPaymentAgreement.email
					) }
				</Notice>
			);
		}

		return (
			<Notice variant="info">
				{ __( 'This purchase is currently billed to your PayPal account.' ) }
			</Notice>
		);
	}

	return null;
}
