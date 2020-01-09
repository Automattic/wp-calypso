/**
 * External Dependencies
 */
import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { map, includes } from 'lodash';

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
		const { variation, isLoading, children } = this.props;

		// if it's loading and there's a variation to display, maybe display the variation.
		// if it's loading and there's not a variation, don't show the variation
		// if there's a variation, maybe show the variation
		if ( ( isLoading && variation ) || variation || ( ! isLoading && variation == null ) ) {
			if ( includes( this.acceptedVariation, variation ) ) {
				return children;
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
		const { variation, isLoading, children } = this.props;
		if ( variation == null && isLoading ) return children;
		return null;
	}
}

/**
 * The experiment component to display the experiment variations
 */
export class RawExperiment extends Component< ExperimentProps, State > {
	render() {
		const { isLoading, variation } = this.props;
		return map( React.Children.toArray( this.props.children ), elem =>
			React.cloneElement( elem, { variation, isLoading } )
		);
	}
}

export default connect( () => {}, {} )( RawExperiment );
