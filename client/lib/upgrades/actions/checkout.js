/**
 * External dependencies
 */
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import { setTransactionStep } from 'lib/transaction/actions';
import { submit } from 'lib/store-transactions';

export function submitTransaction( { cart, transaction, successUrl, cancelUrl } ) {
	submit(
		{
			cart,
			payment: transaction.payment,
			domainDetails: transaction.domainDetails,
			successUrl,
			cancelUrl,
			stripe: transaction.stripe,
			stripeConfiguration: transaction.stripeConfiguration,
		},
		// Execute every step handler in its own event loop tick, so that a complete React
		// rendering cycle happens on each step and `componentWillReceiveProps` of objects
		// like the `TransactionStepsMixin` are called with every step.
		step => defer( () => setTransactionStep( step ) )
	);
}
