import { connect } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import { stopPerformanceTracking } from './lib';

export const withStopPerformanceTrackingProp = ( () => {
	return connect( null, {
		stopPerformanceTracking: ( metadata = {} ) => ( dispatch, getState ) => {
			const state = getState();
			const sectionName = getSectionName( state );
			stopPerformanceTracking( sectionName, { state, metadata } );
		},
	} );
} )();
