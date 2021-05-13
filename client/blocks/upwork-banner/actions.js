/**
 * Internal Dependencies
 */
import { getPreference } from 'calypso/state/preferences/selectors';
import { savePreference } from 'calypso/state/preferences/actions';

export const dismissBanner = ( location ) => ( dispatch, getState ) => {
	const preference = getPreference( getState(), 'upwork-dismissible-banner' ) || {};
	return dispatch(
		savePreference( 'upwork-dismissible-banner', {
			...preference,
			...{
				[ location ]: [
					...( preference[ location ] || [] ),
					{
						dismissedAt: Date.now(),
						type: 'dismiss',
					},
				],
			},
		} )
	);
};
