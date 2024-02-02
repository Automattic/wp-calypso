import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent, enhanceWithUserIsDevAccount } from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';
import type { AnyAction, Store } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

export const useRecordTracksEventWithUserIsDevAccount = () => {
	const dispatch = useDispatch() as ThunkDispatch< Store, void, AnyAction >;

	return useCallback(
		( name: string, properties?: Record< string, string > ) => {
			const recordEvent = withEnhancers( recordTracksEvent, [ enhanceWithUserIsDevAccount ] );

			dispatch( recordEvent( name, properties ) );
		},
		[ dispatch ]
	);
};
