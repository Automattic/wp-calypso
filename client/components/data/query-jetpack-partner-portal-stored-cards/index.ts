import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchStoredCards } from 'calypso/state/partner-portal/stored-cards/actions';
import { isFetchingStoredCards } from 'calypso/state/partner-portal/stored-cards/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

const request = () => ( dispatch: CalypsoDispatch, getState: AppState ) => {
	if ( ! isFetchingStoredCards( getState() ) ) {
		dispatch( fetchStoredCards() );
	}
};

function QueryJetpackPartnerPortalStoredCards() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}

export default QueryJetpackPartnerPortalStoredCards;
