/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { fixThreat, ignoreThreat } from 'state/jetpack-scan/threats/actions';
import { FixableThreat, Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import getSiteScanUpdatingThreats from 'state/selectors/get-site-scan-updating-threats';

export const useThreats = ( siteId: number ) => {
	const [ selectedThreat, setSelectedThreat ] = React.useState< Threat >();
	const updatingThreats = useSelector( ( state ) => getSiteScanUpdatingThreats( state, siteId ) );
	const dispatch = useDispatch();

	const updateThreat = React.useCallback(
		( action: 'fix' | 'ignore' ) => {
			if ( typeof selectedThreat !== 'undefined' ) {
				const eventName =
					action === 'fix' ? 'calypso_scan_threat_fix' : 'calypso_scan_threat_ignore';
				dispatch(
					recordTracksEvent( eventName, {
						site_id: siteId,
						threat_signature: selectedThreat.signature,
					} )
				);
				const actionCreator = action === 'fix' ? fixThreat : ignoreThreat;
				dispatch( actionCreator( siteId, selectedThreat.id ) );
			}
		},
		[ dispatch, selectedThreat, siteId ]
	);

	const fixThreats = React.useCallback(
		( fixableThreats: FixableThreat[] ) => {
			dispatch(
				recordTracksEvent( `calypso_scan_all_threats_fix`, {
					site_id: siteId,
					threats_number: fixableThreats.length,
				} )
			);
			fixableThreats.forEach( ( threat ) => {
				dispatch( fixThreat( siteId, threat.id ) );
			} );
		},
		[ dispatch, siteId ]
	);

	return {
		updatingThreats,
		selectedThreat,
		setSelectedThreat,
		fixThreats,
		updateThreat,
	};
};
