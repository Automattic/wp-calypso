import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FixableThreat, Threat } from 'calypso/components/jetpack/threat-item/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fixAllThreats, fixThreat, ignoreThreat } from 'calypso/state/jetpack-scan/threats/actions';
import getSiteScanUpdatingThreats from 'calypso/state/selectors/get-site-scan-updating-threats';

export const useThreats = ( siteId: number ) => {
	const [ selectedThreat, setSelectedThreat ] = useState< Threat >();
	const updatingThreats = useSelector( ( state ) => getSiteScanUpdatingThreats( state, siteId ) );
	const dispatch = useDispatch();

	const updateThreat = useCallback(
		( action: 'fix' | 'ignore' ) => {
			if ( typeof selectedThreat !== 'undefined' ) {
				const eventName =
					action === 'fix'
						? 'calypso_jetpack_scan_threat_fix'
						: 'calypso_jetpack_scan_threat_ignore';
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

	const fixThreats = useCallback(
		( fixableThreats: FixableThreat[] ) => {
			dispatch(
				recordTracksEvent( `calypso_jetpack_scan_allthreats_fix`, {
					site_id: siteId,
					threats_number: fixableThreats.length,
				} )
			);
			dispatch(
				fixAllThreats(
					siteId,
					fixableThreats.map( ( threat ) => threat.id )
				)
			);
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
