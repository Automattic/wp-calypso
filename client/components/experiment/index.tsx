/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, includes } from 'lodash';

interface ExperimentProps {
	name: string;
	children: Variation & DefaultVariation & LoadingVariations;
	variation?: string;
	isLoading: boolean;
}

interface VariationProps {
	name: string;
	children?: any;
	variation?: string;
	isLoading: boolean;
}

type State = {};

export class Variation extends Component< VariationProps, State > {
	acceptedVariation: ( string | null | undefined )[] = [ this.props.name ];

	render() {
		const { variation, isLoading, children } = this.props;
		if ( ( isLoading && variation ) || variation || ( ! isLoading && variation == null ) ) {
			if ( includes( this.acceptedVariation, variation ) ) {
				return children;
			}
		}
		return null;
	}
}

export class DefaultVariation extends Variation {
	acceptedVariation = [ null, undefined, this.props.name ];
}

export class LoadingVariations extends Component< VariationProps, State > {
	render() {
		const { variation, isLoading, children } = this.props;
		if ( variation == null && isLoading ) return children;
		return null;
	}
}

export class RawExperiment extends Component< ExperimentProps, State > {
	render() {
		const { isLoading, variation } = this.props;
		return map( React.Children.toArray( this.props.children ), elem =>
			React.cloneElement( elem, { variation, isLoading } )
		);
	}
}

export default connect( x => x, {} )( RawExperiment );
