import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchStoredCards } from 'calypso/state/stored-cards/actions';
import { isFetchingStoredCards } from 'calypso/state/stored-cards/selectors';

const request = () => ( dispatch, getState ) => {
	if ( ! isFetchingStoredCards( getState() ) ) {
		dispatch( fetchStoredCards() );
	}
};

function QueryStoredCards() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}

export default QueryStoredCards;
