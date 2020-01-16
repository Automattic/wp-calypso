/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'types';

/**
 * Internal Dependencies
 */
import { getVariationForUser, isLoading } from 'state/experiments/selectors';
import QueryExperiments from 'components/data/query-experiments';
import ExperimentProps from './experimentProps';

export { default as Variation } from './variation';
export { default as DefaultVariation } from './defaultVariation';
export { default as LoadingVariations } from './loadingVariations';

/**
 * The experiment component to display the experiment variations
 */
export class RawExperiment extends Component< ExperimentProps, {} > {
	render() {
		const { isLoading: loading, variation, children } = this.props;
		return (
			<>
				<QueryExperiments />
				{ React.Children.map( children, elem =>
					React.cloneElement( elem, { variation, isLoading: loading } )
				) }
			</>
		);
	}
}

function mapStateToProps( state: AppState, ownProps?: ExperimentProps ): ExperimentProps {
	// todo: throw error in dev mode if name is not defined
	if ( ownProps == null || ownProps.name == null )
		return {
			name: 'unknown_experiment',
			children: null,
			isLoading: false,
		};
	const { name: experimentName } = ownProps;
	return {
		isLoading: isLoading( state, experimentName ),
		variation: getVariationForUser( state, experimentName ),
		...ownProps,
	};
}

export default connect( mapStateToProps )( RawExperiment );
