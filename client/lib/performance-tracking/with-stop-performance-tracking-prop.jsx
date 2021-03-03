/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { stopPerformanceTracking } from './lib';
import { getSectionName } from 'calypso/state/ui/selectors';

export const withStopPerformanceTrackingProp = ( () => {
	return connect( null, {
		stopPerformanceTracking: ( metadata = {} ) => ( dispatch, getState ) => {
			const state = getState();
			const sectionName = getSectionName( state );
			stopPerformanceTracking( sectionName, { state, metadata } );
		},
	} );
} )();
