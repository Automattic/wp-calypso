import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

export const useQueryUserPurchases = ( enabled = true ) => {
	const userId = useSelector( getCurrentUserId );
	const isRequesting = useSelector( ( state ) => state.purchases.isFetchingUserPurchases );
	const hasLoaded = useSelector( ( state ) => state.purchases.hasLoadedUserPurchasesFromServer );
	const reduxDispatch = useDispatch();

	useEffect( () => {
		if ( ! userId || isRequesting || hasLoaded || ! enabled ) {
			return;
		}
		reduxDispatch( fetchUserPurchases( userId ) );
	}, [ userId, isRequesting, hasLoaded, reduxDispatch, enabled ] );
};

export default QueryUserPurchases;
