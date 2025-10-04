import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import type { Purchase, AssignPaymentMethodParams } from '@automattic/api-core';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

type AssignPaymentMethodMutation = ( params: AssignPaymentMethodParams ) => Promise< unknown >;

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

function isValidExistingCardData( data: unknown ): data is ExistingCardSubmitData {
	const existingCardData = data as ExistingCardSubmitData;
	return !! existingCardData.storedDetailsId;
}

interface ExistingCardSubmitData {
	storedDetailsId: string;
}
