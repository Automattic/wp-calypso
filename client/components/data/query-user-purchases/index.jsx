import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { fetchUserPurchases } from 'calypso/state/purchases/actions';
import {
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'calypso/state/purchases/selectors';

const request = ( dispatch, getState ) => {
	const state = getState();

	const userId = getCurrentUserId( state );
	const isFetching = isFetchingUserPurchases( state );
	const hasLoaded = hasLoadedUserPurchasesFromServer( state );

	if ( userId && ! isFetching && ! hasLoaded ) {
		dispatch( fetchUserPurchases( userId ) );
	}
};

function QueryUserPurchases() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request );
	} );

	return null;
}

export default QueryUserPurchases;
