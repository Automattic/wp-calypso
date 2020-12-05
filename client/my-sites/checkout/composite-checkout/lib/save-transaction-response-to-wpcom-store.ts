/**
 * External dependencies
 */
import { defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import type { TransactionResponse } from '../types/wpcom-store-state';

const { dispatch } = defaultRegistry;

export default async function saveTransactionResponseToWpcomStore(
	result: TransactionResponse
): Promise< TransactionResponse > {
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	dispatch( 'wpcom' ).setTransactionResponse( result );
	return result;
}
