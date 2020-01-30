/**
 * External Dependencies
 */
import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'types';

/**
 * Internal Dependencies
 */
import { getVariationForUser, isLoading } from 'state/experiments/selectors';
import QueryExperiments from 'components/data/query-experiments';
import { ExperimentProps } from './experiment-props';

export { default as Variation } from './variation';
export { default as DefaultVariation } from './default-variation';
export { default as LoadingVariations } from './loading-variations';

/**
 * The experiment component to display the experiment variations
 *
 * @param props The properties that describe the experiment
 */
export const Experiment: FunctionComponent< ExperimentProps > = props => {
	const { isLoading: loading, variation, children } = props;
	return (
		<>
			<QueryExperiments />
			{ React.Children.map( children, elem =>
				React.cloneElement( elem, { variation, isLoading: loading } )
			) }
		</>
	);
};

function mapStateToProps( state: AppState, ownProps?: ExperimentProps ): ExperimentProps {
	if ( ! process.env.NODE_ENV || process.env.NODE_ENV === 'development' ) {
		if ( ownProps == null || ownProps.name == null ) {
			throw 'Experiment name is not defined!';
		}
	}
	if ( ownProps == null || ownProps.name == null )
		return {
			name: 'unknown_experiment',
			children: null,
			isLoading: false,
		};
	const { name: experimentName } = ownProps;
	return {
		isLoading: isLoading( state ),
		variation: getVariationForUser( state, experimentName ),
		...ownProps,
	};
}

export default connect( mapStateToProps )( Experiment );
