/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { includes } from 'lodash';

/**
 * Internal Dependencies
 */
import { VariationProps } from './variation-props';

/**
 * Behavior for variations
 *
 * This is a class component so we can use polymorphism to change the behavior in DefaultVariation
 */
export default class Variation extends Component< VariationProps, {} > {
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
