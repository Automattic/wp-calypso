/**
 * Internal Dependencies
 */
import { getPreference } from 'state/preferences/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { savePreference } from 'state/preferences/actions';

export const dismissNudge = () => ( dispatch, getState ) => {
	const siteId = getSelectedSiteId( getState() );
	const preference = getPreference( getState(), 'ecommerce-manage-dismissible-nudge' ) || {};

	return dispatch(
		savePreference(
			'ecommerce-manage-dismissible-nudge',
			Object.assign( {}, preference, {
				[ siteId ]: [
					...( preference[ siteId ] || [] ),
					{
						dismissedAt: Date.now(),
						type: 'dismiss',
					},
				],
			} )
		)
	);
};
