import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logError } from '../../panel/helpers/log-error';
import { useAppContext } from '../context';

/**
 * Applies a notification preference to the store first, then hands it to the host to
 * persist, rolling the store back if that fails.
 *
 * The panel's controls save on change rather than behind a Save button, so the tab strip
 * has to react immediately instead of waiting for the round trip.
 */
export const useSavePreference = () => {
	const dispatch = useDispatch();
	const { onPreferenceChange } = useAppContext();

	return useCallback(
		( {
			key,
			value,
			apply,
			revert,
		}: {
			key: string;
			value: unknown;
			apply: () => { type: string };
			revert: () => { type: string };
		} ) => {
			dispatch( apply() );

			// `Promise.resolve().then` so a synchronous throw from the host lands in the
			// same catch as a rejected request and still rolls back.
			Promise.resolve()
				.then( () => onPreferenceChange( key, value ) )
				.catch( ( error: unknown ) => {
					logError( error );
					dispatch( revert() );
				} );
		},
		[ dispatch, onPreferenceChange ]
	);
};
