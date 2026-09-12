import { useDispatch } from 'react-redux';
import { logError } from '../../panel/helpers/log-error';
import { updateNotificationPreferences } from '../../panel/rest-client/wpcom';

/**
 * Applies a notification preference to the store first, then persists it, rolling the
 * store back if the request fails.
 *
 * The panel's controls save on change rather than behind a Save button, so the tab strip
 * has to react immediately instead of waiting for the round trip.
 */
export const useSavePreference = () => {
	const dispatch = useDispatch();

	return ( {
		preferences,
		apply,
		revert,
	}: {
		preferences: Record< string, unknown >;
		apply: () => { type: string };
		revert: () => { type: string };
	} ) => {
		dispatch( apply() );

		// `Promise.resolve().then` so a synchronous throw — an uninitialised REST client,
		// say — lands in the same catch as a failed request and still rolls back.
		Promise.resolve()
			.then( () => updateNotificationPreferences( preferences ) )
			.catch( ( error: unknown ) => {
				logError( error );
				dispatch( revert() );
			} );
	};
};
