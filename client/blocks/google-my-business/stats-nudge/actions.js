/** @format */

/**
 * Internal Dependencies
 */
import { getPreference } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';

export const dismissNudge = () => ( dispatch, getState ) => {
	const nudgePreference = getPreference( getState(), 'google-my-business-dismissible-nudge' );
	return dispatch(
		savePreference( 'google-my-business-dismissible-nudge', {
			lastDismissed: Date.now(),
			timesDismissed: nudgePreference ? 1 + nudgePreference.timesDismissed : 1,
		} )
	);
};
