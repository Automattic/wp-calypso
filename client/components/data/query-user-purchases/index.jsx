import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUserPurchases } from 'calypso/state/purchases/actions';
import {
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'calypso/state/purchases/selectors';

const request = ( userId ) => ( dispatch, getState ) => {
	const isFetching = isFetchingUserPurchases( getState() );
	const hasLoaded = hasLoadedUserPurchasesFromServer( getState() );

	if ( userId && ! isFetching && ! hasLoaded ) {
		dispatch( fetchUserPurchases( userId ) );
	}
};

function QueryUserPurchases( { userId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( userId ) );
	}, [ dispatch, userId ] );

	return null;
}

QueryUserPurchases.propTypes = {
	userId: PropTypes.number.isRequired,
};

export default QueryUserPurchases;
