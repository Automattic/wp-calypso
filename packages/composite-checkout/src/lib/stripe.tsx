type StripePaymentIntent = { status?: string };
type TransactionsEndpointResponse = { message: { payment_intent_client_secret: string } };
type StripeConfiguration = { public_key: string };
type StripeObject = {
	handleCardPayment: (
		secret: string,
		options: {}
	) => Promise< { paymentIntent: StripePaymentIntent; error: { message: string } } >;
};
declare global {
	interface Window {
		Stripe: ( key: string ) => StripeObject;
	}
}

/**
 * An error related to a Stripe PaymentMethod
 *
 * The object will include the original stripe error in the stripeError prop.
 *
 * @param {object} stripeError - The original Stripe error object
 */
class StripePaymentMethodError extends Error {
	public stripeError: { message: string };

	constructor( stripeError: { message: string } ) {
		super( stripeError.message );
		Object.setPrototypeOf( this, new.target.prototype ); // restore prototype chain: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
		this.stripeError = stripeError;
		this.message = stripeError.message;
	}
}

/**
 * Confirm any StripePaymentIntent from Stripe response and carry out 3DS or
 * other next_actions if they are required.
 *
 * If there is an error, it will include a `message` field which can be used to
 * display the error. It will also include a `type` and possibly other fields
 * depending on the type.
 *
 * @param {object} stripeConfiguration The data from the Stripe Configuration endpoint
 * @param {string} paymentIntentClientSecret The client secret of the StripePaymentIntent
 * @returns {Promise} Promise that will be resolved or rejected
 */
async function confirmStripePaymentIntent(
	stripeConfiguration: StripeConfiguration,
	paymentIntentClientSecret: string
): Promise< StripePaymentIntent > {
	// Setup a stripe instance that is disconnected from our Elements
	// Otherwise, we'll create another paymentMethod, which we don't want
	const standAloneStripe = window.Stripe( stripeConfiguration.public_key );

	const { paymentIntent, error } = await standAloneStripe.handleCardPayment(
		paymentIntentClientSecret,
		{}
	);
	if ( error ) {
		// Note that this is a promise rejection
		throw new StripePaymentMethodError( error );
	}

	return paymentIntent;
}

export async function showStripeModalAuth( {
	stripeConfiguration,
	response,
}: {
	stripeConfiguration: StripeConfiguration;
	response: TransactionsEndpointResponse;
} ): Promise< StripePaymentIntent | null > {
	const authenticationResponse = await confirmStripePaymentIntent(
		stripeConfiguration,
		response.message.payment_intent_client_secret
	);

	if ( authenticationResponse?.status ) {
		return authenticationResponse;
	}
	return null;
}
