import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { requestBillingTransactions } from 'calypso/state/billing-transactions/actions';
import { BillingTransactionsType } from 'calypso/state/billing-transactions/types';
import isRequestingBillingTransactions from 'calypso/state/selectors/is-requesting-billing-transactions';
import { IAppState } from 'calypso/state/types';

export type QueryBillingTransactionsProps = ConnectedProps< typeof connector > & {
	transactionType?: BillingTransactionsType;
};

const QueryBillingTransactions: React.FunctionComponent< QueryBillingTransactionsProps > = ( {
	requestingBillingTransactions,
	requestBillingTransactions,
	transactionType,
} ) => {
	useEffect( () => {
		if ( requestingBillingTransactions ) {
			return;
		}

		requestBillingTransactions( transactionType );
	}, [] );

	return null;
};

const connector = connect(
	( state: IAppState ) => ( {
		requestingBillingTransactions: isRequestingBillingTransactions( state ),
	} ),
	{ requestBillingTransactions }
);

export default connector( QueryBillingTransactions );
