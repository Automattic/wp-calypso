/**
 * Stripe card processor for Dashboard checkout
 * Handles credit card payments via Stripe
 */
import {
	confirmStripePaymentIntent,
	confirmStripeSetupIntentAndAttachCard,
	createStripePaymentMethod,
} from '@automattic/calypso-stripe';
import {
	makeSuccessResponse,
	makeErrorResponse,
	type PaymentProcessorResponse,
} from '@automattic/composite-checkout';
import { createTransactionCart, createTransactionRequest } from '../transaction-utils';
import { existingCardProcessor } from './existing-card-processor';
import type {
	TransactionRequest,
	StripeConfiguration,
	TransactionResponse,
	SaveCreditCardParams,
	StoredPaymentMethod,
} from '@automattic/api-core';
import type { DomainContactDetails, ResponseCart } from '@automattic/shopping-cart';
import type { Stripe, StripeCardNumberElement } from '@stripe/stripe-js';

export interface StripeCardProcessorSubmitData {
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
	cardNumberElement: StripeCardNumberElement;
	name: string;
}

export interface StripeCardProcessorOptions {
	siteId: number;
	responseCart: ResponseCart;
	countryCode?: string;
	postalCode?: string;
	subdivisionCode?: string;
	domainDetails?: DomainContactDetails | null;
	onAnalyticsEvent?: ( event: string, properties?: Record< string, unknown > ) => void;
	/**
	 * Functions required for the free-purchase new-card flow.
	 * When the cart total is $0, a new card cannot be charged directly; instead
	 * it must be saved first and then charged as a stored card.
	 */
	createSetupIntent: ( params: { country?: string } ) => Promise< { setup_intent_id?: string } >;
	saveCreditCard: ( params: SaveCreditCardParams ) => Promise< StoredPaymentMethod >;
}

/**
 * Returns true if the transaction response requires a 3DS authentication challenge.
 */
function doesResponseRequire3DS( response: unknown ): response is TransactionResponse & {
	message: { requires_action: true; payment_intent_client_secret: string };
} {
	if ( ! response || typeof response !== 'object' ) {
		return false;
	}
	const r = response as TransactionResponse;
	return !! ( r.message?.requires_action && r.message?.payment_intent_client_secret );
}

/**
 * Process a Stripe card payment transaction.
 *
 * For free carts ($0), the card is first saved as a stored payment method via
 * a Stripe setup intent, then charged immediately using the stored-card processor.
 * This mirrors the behaviour in Calypso's multi-partner-card-processor.
 */
export async function stripeCardProcessor(
	submitData: StripeCardProcessorSubmitData,
	submitTransaction: ( request: TransactionRequest ) => Promise< unknown >,
	options: StripeCardProcessorOptions
): Promise< PaymentProcessorResponse > {
	const {
		siteId,
		responseCart,
		countryCode,
		postalCode,
		subdivisionCode,
		domainDetails,
		onAnalyticsEvent,
		createSetupIntent,
		saveCreditCard,
	} = options;

	onAnalyticsEvent?.( 'calypso_checkout_payment_method_submit', {
		payment_method: 'stripe',
	} );

	const isFreeCart = responseCart.total_cost_integer === 0 && responseCart.products.length > 0;

	if ( isFreeCart ) {
		// Free-purchase flow: save the card first, then charge $0 using the stored-card processor.
		return stripeCardFreePurchaseProcessor(
			submitData,
			submitTransaction,
			{ siteId, responseCart, countryCode, postalCode, subdivisionCode, domainDetails },
			{ createSetupIntent, saveCreditCard }
		);
	}

	// Step 1: Create Stripe payment method token
	let paymentMethodToken: string;
	try {
		const tokenResponse = await createStripePaymentMethod(
			submitData.stripe,
			submitData.cardNumberElement,
			{
				name: submitData.name,
				address: {
					country: countryCode,
					postal_code: postalCode,
				},
			}
		);
		paymentMethodToken = tokenResponse.id;
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}

	// Step 2: Create the transaction cart
	const cart = createTransactionCart( {
		siteId,
		responseCart,
	} );

	// Step 3: Create the transaction request with Stripe payment info
	const transactionRequest = createTransactionRequest( {
		cart,
		payment: {
			payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
			payment_key: paymentMethodToken,
			payment_partner: submitData.stripeConfiguration.processor_id,
			name: submitData.name,
			country: countryCode,
			country_code: countryCode,
			postal_code: postalCode,
			zip: postalCode,
		},
		domainDetails: domainDetails ?? null,
	} );

	// Step 4: Submit the transaction
	let response: unknown;
	try {
		response = await submitTransaction( transactionRequest );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}

	// Step 5: Handle 3DS challenge if required
	if ( doesResponseRequire3DS( response ) ) {
		try {
			await confirmStripePaymentIntent(
				submitData.stripe,
				response.message.payment_intent_client_secret
			);
		} catch ( error ) {
			return makeErrorResponse( ( error as Error ).message );
		}
	}

	return makeSuccessResponse( response );
}

/**
 * For free ($0) carts: save the new card via a Stripe setup intent, then
 * immediately process a $0 charge using the stored-card processor.
 *
 * This is necessary because the standard Stripe payment method flow requires
 * an actual charge amount; stored cards support $0 transactions.
 */
async function stripeCardFreePurchaseProcessor(
	submitData: StripeCardProcessorSubmitData,
	submitTransaction: ( request: TransactionRequest ) => Promise< unknown >,
	transactionOptions: {
		siteId: number;
		responseCart: ResponseCart;
		countryCode?: string;
		postalCode?: string;
		subdivisionCode?: string;
		domainDetails?: DomainContactDetails | null;
	},
	saveOptions: {
		createSetupIntent: ( params: { country?: string } ) => Promise< { setup_intent_id?: string } >;
		saveCreditCard: ( params: SaveCreditCardParams ) => Promise< StoredPaymentMethod >;
	}
): Promise< PaymentProcessorResponse > {
	const { siteId, responseCart, countryCode, postalCode, subdivisionCode, domainDetails } =
		transactionOptions;
	const { createSetupIntent, saveCreditCard } = saveOptions;

	// Step 1: Create a Stripe setup intent on the server
	let setupIntentId: string;
	try {
		const setupIntentResult = await createSetupIntent( { country: countryCode } );
		if ( ! setupIntentResult.setup_intent_id ) {
			throw new Error( 'Failed to create setup intent' );
		}
		setupIntentId = setupIntentResult.setup_intent_id;
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}

	// Step 2: Confirm the setup intent with the card details
	let paymentMethodId: string;
	let setupKey: string;
	try {
		const setupIntentResult = await confirmStripeSetupIntentAndAttachCard(
			submitData.stripe,
			submitData.cardNumberElement,
			setupIntentId,
			{
				name: submitData.name || '',
				address: {
					country: countryCode,
					postal_code: postalCode || '',
				},
			}
		);
		paymentMethodId = setupIntentResult.payment_method as string;
		setupKey = setupIntentResult.id;
		if ( ! paymentMethodId ) {
			throw new Error( 'Failed to attach card to setup intent' );
		}
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}

	// Step 3: Save the card to the user's account
	let savedCard: StoredPaymentMethod;
	try {
		savedCard = await saveCreditCard( {
			paymentKey: paymentMethodId,
			paygateToken: paymentMethodId,
			paymentPartner: submitData.stripeConfiguration.processor_id,
			useForExisting: false,
			postalCode,
			countryCode,
			taxSubdivisionCode: subdivisionCode,
			setupKey,
		} );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}

	if ( ! savedCard.stored_details_id || ! savedCard.mp_ref || ! savedCard.payment_partner ) {
		return makeErrorResponse( 'New card was not saved correctly.' );
	}

	// Step 4: Charge the $0 cart using the newly saved card via the stored-card processor
	return existingCardProcessor(
		{
			name: submitData.name,
			storedDetailsId: savedCard.stored_details_id,
			paymentMethodToken: savedCard.mp_ref,
			paymentPartnerProcessorId: savedCard.payment_partner,
		},
		submitTransaction,
		{ siteId, responseCart, countryCode, postalCode, domainDetails }
	);
}
