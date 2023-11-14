import { makeSuccessResponse, makeErrorResponse } from '@automattic/composite-checkout';
import { doesPurchaseHaveFullCredits } from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import { recordTransactionBeginAnalytics } from './analytics';
import getDomainDetails from './get-domain-details';
import getPostalCode from './get-postal-code';
import submitWpcomTransaction from './submit-wpcom-transaction';
import {
	createTransactionEndpointRequestPayload,
	createTransactionEndpointCartFromResponseCart,
} from './translate-cart';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { TransactionRequest } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:free-purchase-processor' );

type SubmitFreePurchaseTransactionData = Omit<
	TransactionRequest,
	'paymentMethodType' | 'paymentPartnerProcessorId' | 'cart'
>;

export default async function freePurchaseProcessor(
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	const {
		responseCart,
		reloadCart,
		includeDomainDetails,
		includeGSuiteDetails,
		contactDetails,
		reduxDispatch,
	} = transactionOptions;

	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId: 'free-purchase' } ) );

	const taxData = doesPurchaseHaveFullCredits( responseCart )
		? {
				country: contactDetails?.countryCode?.value ?? '',
				postalCode: getPostalCode( contactDetails ),
				subdivisionCode: contactDetails?.state?.value,
		  }
		: {
				// This data is intentionally empty so we do not charge taxes for free
				// purchases that are not using credits.
				country: '',
				postalCode: '',
		  };

	const formattedTransactionData = prepareFreePurchaseTransaction(
		{
			name: '',
			couponId: responseCart.coupon,
			domainDetails: getDomainDetails( contactDetails, {
				includeDomainDetails,
				includeGSuiteDetails,
			} ),
			...taxData,
		},
		transactionOptions
	);

	return submitWpcomTransaction( formattedTransactionData, transactionOptions )
		.then( makeSuccessResponse )
		.catch( ( error ) => {
			// Refresh the cart in case things have changed during the transaction.
			reloadCart();

			return makeErrorResponse( error.message );
		} );
}

function prepareFreePurchaseTransaction(
	transactionData: SubmitFreePurchaseTransactionData,
	transactionOptions: PaymentProcessorOptions
) {
	debug( 'formatting free transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayload( {
		...transactionData,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: transactionOptions.siteId,
			contactDetails: transactionData.domainDetails ?? null,
			responseCart: doesPurchaseHaveFullCredits( transactionOptions.responseCart )
				? transactionOptions.responseCart
				: removeTaxInformationFromCart( transactionOptions.responseCart ),
		} ),
		paymentMethodType: 'WPCOM_Billing_WPCOM',
	} );
	debug( 'submitting free transaction', formattedTransactionData );
	return formattedTransactionData;
}

function removeTaxInformationFromCart( cart: ResponseCart ): ResponseCart {
	return {
		...cart,
		tax: {
			display_taxes: false,
			location: {},
		},
	};
}
