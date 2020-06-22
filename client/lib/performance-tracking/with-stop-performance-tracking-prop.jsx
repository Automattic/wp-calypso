/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { stopPerformanceTracking } from './lib';
import { getSectionName } from 'state/ui/selectors';

export const withStopPerformanceTrackingProp = ( () => {
	let capuredState;
	return connect(
		( state ) => {
			capuredState = state;
			// No need to pass anything as props, avoid messing with existing props
			return {};
		},
		() => {
			return {
				stopPerformanceTracking: () => {
					const sectionName = getSectionName( capuredState );
					stopPerformanceTracking( sectionName, capuredState );
				},
			};
		}
	);
} )();
