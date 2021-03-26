/**
 * External dependencies
 */
import { defaultRegistry, makeSuccessResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { submitApplePayPayment } from './payment-method-helpers';
import getPostalCode from './lib/get-postal-code';
import getDomainDetails from './lib/get-domain-details';
import submitWpcomTransaction from './lib/submit-wpcom-transaction';

const { select } = defaultRegistry;

export async function applePayProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails, responseCart },
	transactionOptions
) {
	return submitApplePayPayment(
		{
			...submitData,
			couponId: responseCart.coupon,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			postalCode: getPostalCode(),
		},
		submitWpcomTransaction,
		transactionOptions
	).then( makeSuccessResponse );
}
