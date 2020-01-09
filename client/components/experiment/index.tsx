/**
 * External Dependencies
 */
import React, { Component, ReactElement } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

interface ExperimentProps {
	name: string;
	children: ReactElement[];
	variation?: string;
}

interface VariationProps {
	name: string;
	children: any;
	variation?: string;
}

type State = {};

export class Variation extends Component< VariationProps, State > {
	render() {
		if ( this.props.variation === this.props.name ) {
			return this.props.children;
		}
		return null;
	}
}

export class DefaultVariation extends Variation {
	render() {
		if ( this.props.variation == null || this.props.variation === this.props.name ) {
			return this.props.children;
		}
		return null;
	}
}

export class RawExperiment extends Component< ExperimentProps, State > {
	render() {
		return map( React.Children.toArray( this.props.children ), elem =>
			React.cloneElement( elem, { variation: this.props.variation } )
		);
	}
}

export default connect( x => x, {} )( RawExperiment );
