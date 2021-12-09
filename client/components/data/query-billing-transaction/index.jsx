import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestBillingTransaction } from 'calypso/state/billing-transactions/individual-transactions/actions';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import isRequestingBillingTransaction from 'calypso/state/selectors/is-requesting-billing-transaction';

const request = ( transactionId ) => ( dispatch, getState ) => {
	const transaction = getPastBillingTransaction( getState(), transactionId );
	const isRequesting = isRequestingBillingTransaction( getState(), transactionId );

	if ( ! transaction && ! isRequesting ) {
		dispatch( requestBillingTransaction( transactionId ) );
	}
};

function QueryBillingTransaction( { transactionId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( transactionId ) );
	}, [ dispatch, transactionId ] );

	return null;
}

QueryBillingTransaction.propTypes = {
	transactionId: PropTypes.string.isRequired,
};

export default QueryBillingTransaction;
