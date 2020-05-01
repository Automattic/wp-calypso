/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { fixThreatAlert, ignoreThreatAlert } from 'state/jetpack/site-alerts/actions';
import { FixableThreat, Threat } from 'landing/jetpack-cloud/components/threat-item/types';

export const useThreats = ( siteId: number, threats: Threat[] ) => {
	// @todo: we need to move the state about threats being updated into our store. Otherwise, components
	// can't react to those state changes. This component needs to be aware of the threats that are being
	// updated because, for instance, it needs to block the [Fix all threats] button while the update is
	// happening. The same applies for the individual buttons of each ThreatItem. Having that piece of state
	// here doesn't work because we don't know when the update finishes. We need to capture that at the
	// data-layer level.
	const [ updatingThreats, setUpdatingThreats ] = React.useState< Array< Threat > >( [] );
	const [ selectedThreat, setSelectedThreat ] = React.useState< Threat >( threats[ 0 ] );
	const dispatch = useDispatch();

	const updateThreat = React.useCallback(
		( action: 'fix' | 'ignore' ) => {
			const eventName = action === 'fix' ? 'calypso_scan_threat_fix' : 'calypso_scan_threat_ignore';
			dispatch(
				recordTracksEvent( eventName, {
					site_id: siteId,
					threat_signature: selectedThreat.signature,
				} )
			);
			setUpdatingThreats( ( stateThreats ) => [ ...stateThreats, selectedThreat ] );
			const actionCreator = action === 'fix' ? fixThreatAlert : ignoreThreatAlert;
			dispatch( actionCreator( siteId, selectedThreat.id, true ) );
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
				dispatch( fixThreatAlert( siteId, threat.id ) );
			} );
			setUpdatingThreats( fixableThreats );
		},
		[ dispatch, siteId ]
	);

	return {
		updatingThreats,
		setUpdatingThreats,
		selectedThreat,
		setSelectedThreat,
		fixThreats,
		updateThreat,
	};
};
