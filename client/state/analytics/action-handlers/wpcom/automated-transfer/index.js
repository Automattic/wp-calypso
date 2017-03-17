import { mergeHandlers } from 'state/data-layer/utils';

import {
	THEME_TRANSFER_INITIATE_FAILURE as FAILURE,
	THEME_TRANSFER_INITIATE_REQUEST as REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS as SUCCESS,
} from 'state/action-types';

import { getEligibility } from 'state/automated-transfer/selectors';

import { recordTracksEvent } from 'state/analytics/actions';

export const trackFailure = ( store, { plugin } ) => {
	return recordTracksEvent(
		'calypso_automated_transfer_inititate_failure',
		{ plugin },
	);
};

export const trackRequest = ( { getState }, { siteId, plugin } ) => {
	const {
		eligibilityHolds: holds,
		eligibilityWarnings: warnings,
	} = getEligibility( getState(), siteId );

	if ( ! ( holds.length || warnings.length ) ) {
		return recordTracksEvent(
			'calypso_automatic_transfer_plugin_install_no_issues',
			Object.assign( {},
				plugin && { plugin_slug: plugin.slug },
			),
		);
	}

	return recordTracksEvent(
		'calypso_automatic_transfer_plugin_install_ineligible',
		Object.assign( {},
			holds.length && { eligibilityHolds: holds.join( ', ' ) },
			warnings.length && { eligibilityWarnings: warnings.join( ', ' ) },
			plugin && { plugin_slug: plugin.slug },
		),
	);
};

export const trackSuccess = ( store, { plugin } ) => {
	return recordTracksEvent(
		'calypso_automated_transfer_inititate_success',
		{ plugin },
	);
};

export default mergeHandlers( {
	[ FAILURE ]: [ trackFailure ],
	[ REQUEST ]: [ trackRequest ],
	[ SUCCESS ]: [ trackSuccess ],
} );
