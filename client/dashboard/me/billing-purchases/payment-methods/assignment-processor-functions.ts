import {
	makeSuccessResponse,
	makeErrorResponse,
	makeRedirectResponse,
} from '@automattic/composite-checkout';
import { addQueryArgs } from '@wordpress/url';
import type {
	Purchase,
	CreatePayPalAgreementParams,
	AssignPaymentMethodParams,
} from '@automattic/api-core';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

type AssignPaymentMethodMutation = ( params: AssignPaymentMethodParams ) => Promise< unknown >;
type CreatePayPalAgreementMutation = ( params: CreatePayPalAgreementParams ) => Promise< string >;

export async function assignExistingCardProcessor(
	purchase: Purchase | undefined,
	submitData: unknown,
	assignPaymentMethod: AssignPaymentMethodMutation
): Promise< PaymentProcessorResponse > {
	try {
		if ( ! isValidExistingCardData( submitData ) ) {
			throw new Error( 'Credit card data is missing stored details id' );
		}
		const { storedDetailsId } = submitData;
		if ( ! purchase ) {
			throw new Error( 'Cannot assign existing card payment method without a purchase' );
		}
		const data = await assignPaymentMethod( {
			subscriptionId: String( purchase.ID ),
			storedDetailsId,
		} );
		return makeSuccessResponse( data );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}

export async function assignPayPalProcessor(
	purchase: Purchase | undefined,
	submitData: unknown,
	createPayPalAgreement: CreatePayPalAgreementMutation
): Promise< PaymentProcessorResponse > {
	try {
		if ( ! purchase ) {
			throw new Error( 'Cannot assign PayPal payment method without a purchase' );
		}
		if ( ! isValidPayPalData( submitData ) ) {
			throw new Error( 'PayPal data is missing tax information' );
		}
		// PayPal assignment will trigger a redirect to PayPal for authorization
		const redirectUrl = await createPayPalAgreement( {
			subscriptionId: String( purchase.ID ),
			successUrl: addQueryArgs( window.location.href, { success: 'true' } ),
			cancelUrl: window.location.href,
			taxCountryCode: submitData.countryCode,
			taxPostalCode: submitData.postalCode ?? '',
			taxAddress: submitData.address ?? '',
			taxOrganization: submitData.organization ?? '',
			taxCity: submitData.city ?? '',
			taxSubdivisionCode: submitData.state ?? '',
		} );
		return makeRedirectResponse( redirectUrl );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}

function isValidExistingCardData( data: unknown ): data is ExistingCardSubmitData {
	const existingCardData = data as ExistingCardSubmitData;
	return !! existingCardData.storedDetailsId;
}

interface ExistingCardSubmitData {
	storedDetailsId: string;
}

interface PayPalSubmitData {
	postalCode?: string;
	countryCode: string;
	address?: string;
	organization?: string;
	city?: string;
	state?: string;
}

function isValidPayPalData( data: unknown ): data is PayPalSubmitData {
	const payPalData = data as PayPalSubmitData;
	return payPalData.countryCode !== undefined;
}

export async function assignExistingPayPalPPCPProcessor(
	purchase: Purchase | undefined,
	submitData: unknown,
	assignPaymentMethod: AssignPaymentMethodMutation
): Promise< PaymentProcessorResponse > {
	try {
		if ( ! isValidExistingPayPalPPCPData( submitData ) ) {
			throw new Error( 'PayPal data is missing stored details id' );
		}
		const { storedDetailsId } = submitData;
		if ( ! purchase ) {
			throw new Error( 'Cannot assign existing PayPal payment method without a purchase' );
		}
		const data = await assignPaymentMethod( {
			subscriptionId: String( purchase.ID ),
			storedDetailsId,
		} );
		return makeSuccessResponse( data );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}

function isValidExistingPayPalPPCPData( data: unknown ): data is ExistingPayPalPPCPSubmitData {
	const existingPayPalData = data as ExistingPayPalPPCPSubmitData;
	return !! existingPayPalData.storedDetailsId;
}

interface ExistingPayPalPPCPSubmitData {
	storedDetailsId: string;
	email: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
}
