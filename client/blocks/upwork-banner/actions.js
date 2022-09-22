import { setPreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { UPWORK_BANNER_STATE } from './constants';

export const dismissBanner = ( location ) => ( dispatch, getState ) => {
	const preference = getPreference( getState(), UPWORK_BANNER_STATE ) || {};
	return dispatch(
		setPreference( UPWORK_BANNER_STATE, {
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
