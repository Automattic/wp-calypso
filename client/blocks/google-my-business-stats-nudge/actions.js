/** @format */

/**
 * Internal Dependencies
 */
import { getPreference } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

const recordDismissAction = type => ( dispatch, getState ) => {
	const siteId = getSelectedSiteId( getState() );
	const nudgePreference = getPreference( getState(), 'google-my-business-dismissible-nudge' ) || {};

	return dispatch(
		savePreference(
			'google-my-business-dismissible-nudge',
			Object.assign( {}, nudgePreference, {
				[ siteId ]: [
					...( nudgePreference[ siteId ] || [] ),
					{
						dismissedAt: Date.now(),
						type,
					},
				],
			} )
		)
	);
};

export const dismissNudge = () => recordDismissAction( 'dismiss' );

export const alreadyListed = () => recordDismissAction( 'already-listed' );
