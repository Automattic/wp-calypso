import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { requestBillingTransaction } from 'calypso/state/billing-transactions/individual-transactions/actions';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import isRequestingBillingTransaction from 'calypso/state/selectors/is-requesting-billing-transaction';
import type { CalypsoDispatch, IAppState } from 'calypso/state/types';

const request =
	( transactionId: number ) => ( dispatch: CalypsoDispatch, getState: () => IAppState ) => {
		const transaction = getPastBillingTransaction( getState(), transactionId );
		const isRequesting = isRequestingBillingTransaction( getState(), transactionId );

		if ( ! transaction && ! isRequesting ) {
			dispatch( requestBillingTransaction( transactionId ) );
		}
	};

export default function QueryBillingTransaction( { transactionId }: { transactionId: number } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( transactionId ) );
	}, [ dispatch, transactionId ] );

	return null;
}
