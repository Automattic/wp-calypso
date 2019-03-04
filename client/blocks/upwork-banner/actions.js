/**
 * Internal Dependencies
 */
import { getPreference } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';

export const dismissBanner = location => ( dispatch, getState ) => {
	const preference = getPreference( getState(), 'upwork-dismissible-banner' ) || {};
	return dispatch(
		savePreference(
			'upwork-dismissible-banner',
			Object.assign( {}, preference, {
				[ location ]: [
					...( preference[ location ] || [] ),
					{
						dismissedAt: Date.now(),
						type: 'dismiss',
					},
				],
			} )
		)
	);
};
