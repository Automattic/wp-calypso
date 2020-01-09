/**
 * External Dependencies
 */
import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { AppState } from 'types';

/**
 * Internal Dependencies
 */
import { getVariationForUser, isLoading } from 'state/experiments/selectors';
import { assignCurrentUserToVariations } from 'state/experiments/actions';

/**
 * The expected props for the top-level experiment component
 */
interface ExperimentProps {
	name: string;
	children: ReactNode;
	variation?: string;
	isLoading?: boolean;
}

/**
 * The expected props for variations
 */
interface VariationProps {
	name: string;
	children?: ReactNode;
	variation?: string;
	isLoading?: boolean;
}

/**
 * The expected props for the loading component
 */
interface LoadingProps {
	children?: ReactNode;
	variation?: string;
	isLoading?: boolean;
}

/**
 * No state
 */
type State = {};

/**
 * Behavior for variations
 * todo: is there a better way to do this?
 */
export class Variation extends Component< VariationProps, State > {
	/**
	 * Defines the variations this component expects
	 */
	acceptedVariation: ( string | null | undefined )[] = [ this.props.name ];

	render() {
		const { variation, isLoading: loading, children } = this.props;

		// if it's loading and there's a variation to display, maybe display the variation.
		// if it's loading and there's not a variation, don't show the variation
		// if there's a variation, maybe show the variation
		if ( ( loading && variation ) || variation || ( ! loading && variation == null ) ) {
			if ( includes( this.acceptedVariation, variation ) ) {
				return <>{ children }</>;
			}
		}
		return null;
	}
}

/**
 * Overrides a regular variation, and adds `null` and `undefined` as possible variations to display
 */
export class DefaultVariation extends Variation {
	acceptedVariation = [ null, undefined, this.props.name ];
}

/**
 * This component displays when the variation is unknown and an API call needs to be made
 */
export class LoadingVariations extends Component< LoadingProps, State > {
	render() {
		const { variation, isLoading: loading, children } = this.props;
		if ( variation == null && loading ) return <>{ children }</>;
		return null;
	}
}

/**
 * The experiment component to display the experiment variations
 */
export class RawExperiment extends Component< ExperimentProps, State > {
	render() {
		const { isLoading: loading, variation, children } = this.props;
		return (
			<>
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

function mapDispatchToProps( dispatch, ownProps?: ExperimentProps ): ExperimentProps | undefined {
	dispatch( assignCurrentUserToVariations() );

	return ownProps;
}

export default connect( mapStateToProps, mapDispatchToProps )( RawExperiment );
