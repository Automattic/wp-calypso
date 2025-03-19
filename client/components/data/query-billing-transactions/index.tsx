import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { requestBillingTransactions } from 'calypso/state/billing-transactions/actions';
import isRequestingBillingTransactions from 'calypso/state/selectors/is-requesting-billing-transactions';
import type { BillingTransactionsType } from 'calypso/state/billing-transactions/types';

type QueryBillingTransactionsProps = {
	transactionType?: BillingTransactionsType;
};

export default function QueryBillingTransactions( {
	transactionType,
}: QueryBillingTransactionsProps ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( ( d, getState ) => {
			if ( isRequestingBillingTransactions( getState() ) ) {
				return;
			}
			d( requestBillingTransactions( transactionType ) );
		} );
	}, [ dispatch, transactionType ] );

	return null;
}
