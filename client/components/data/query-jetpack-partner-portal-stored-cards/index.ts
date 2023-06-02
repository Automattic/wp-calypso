import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { fetchStoredCards } from 'calypso/state/partner-portal/stored-cards/actions';
import { isFetchingStoredCards } from 'calypso/state/partner-portal/stored-cards/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

interface Props {
	paging: {
		startingAfter: string;
		endingBefore: string;
	};
}

const request =
	( paging: { startingAfter: string; endingBefore: string } ) =>
	( dispatch: CalypsoDispatch, getState: AppState ) => {
		if ( ! isFetchingStoredCards( getState() ) ) {
			dispatch( fetchStoredCards( paging ) );
		}
	};

export default function QueryJetpackPartnerPortalStoredCards( { paging }: Props ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( paging ) );
	}, [ dispatch, paging ] );

	return null;
}
