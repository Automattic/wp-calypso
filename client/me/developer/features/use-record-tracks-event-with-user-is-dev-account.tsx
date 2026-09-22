import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent, enhanceWithUserIsDevAccount } from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';
import type { AnyAction, Store } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

/**
 * Get a function that enhances any tracks event with an additional property `user_is_dev_account`
 * to determine if the event was triggered by a user with the `is_dev_account` setting enabled.
 *
 * Example:
 * const recordTracksEventWithUserIsDevAccount = useRecordTracksEventWithUserIsDevAccount();
 * <MyComponent onClick={ () => { recordTracksEventWithUserIsDevAccount( 'some_event', { 'data': 'test' } ) } >
 */
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
