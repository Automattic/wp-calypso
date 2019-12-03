/**
 * Internal Dependencies
 */
import { getPreference } from 'state/preferences/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { savePreference } from 'state/preferences/actions';

export const dismissNudge = () => ( dispatch, getState ) => {
	const siteId = getSelectedSiteId( getState() );
	const preference = getPreference( getState(), 'recurring-payments-dismissible-nudge' ) || {};

	return dispatch(
		savePreference( 'recurring-payments-dismissible-nudge', {
			...preference,
			...{
				[ siteId ]: [
					...( preference[ siteId ] || [] ),
					{
						dismissedAt: Date.now(),
						type: 'dismiss',
					},
				],
			},
		} )
	);
};
