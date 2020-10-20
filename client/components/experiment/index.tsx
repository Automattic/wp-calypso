/**
 * External Dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'calypso/types';

/**
 * Internal Dependencies
 */
import { getVariationForUser, isLoading } from 'calypso/state/experiments/selectors';
import QueryExperiments from 'calypso/components/data/query-experiments';
import { ExperimentProps } from './experiment-props';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export { default as Variation } from './variation';
export { default as DefaultVariation } from './default-variation';
export { default as LoadingVariations } from './loading-variations';

/**
 * The experiment component to display the experiment variations
 *
 * @param props The properties that describe the experiment
 */
export const Experiment: FunctionComponent< ExperimentProps > = ( props ) => {
	const { isLoading: loading, variation, children, name: experimentName } = props;
	const [ eventFired, setEventFired ] = useState< boolean >( false );
	useEffect( () => {
		// set the event fired so we only fire the event after rendering once.
		setEventFired( true );
	}, [] );

	if ( ! eventFired ) {
		// Due to how tracks works, we need to always fire an event immediately to generate an anonid. This event is here
		// to guarantee that we have an anonid if the browser needs one.

		recordTracksEvent( 'calypso_experiment_rendered', {
			experiment_name: experimentName,
		} );
	}

	return (
		<>
			<QueryExperiments />
			{ React.Children.map( children, ( elem ) => {
				return React.cloneElement( elem, { variation, isLoading: loading } );
			} ) }
		</>
	);
};

function mapStateToProps( state: AppState, ownProps?: ExperimentProps ): ExperimentProps {
	if ( ownProps == null || ownProps.name == null ) {
		if ( ! process.env.NODE_ENV || process.env.NODE_ENV === 'development' ) {
			throw 'Experiment name is not defined!';
		}
		return {
			name: '__unknown_experiment__',
			children: null,
			isLoading: false,
		};
	}
	const { name: experimentName } = ownProps;
	return {
		isLoading: isLoading( state ),
		variation: getVariationForUser( state, experimentName ),
		...ownProps,
	};
}

export default connect( mapStateToProps )( Experiment );
