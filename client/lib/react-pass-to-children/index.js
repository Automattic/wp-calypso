/**
 * External dependencies
 */
import { assign } from 'lodash';
import React from 'react';

module.exports = function( element, additionalProps ) {
	var props = assign( {}, element.props, additionalProps ),
		childElements;

	delete props.children;

	if ( React.Children.count( element.props.children ) > 1 ) {
		childElements = React.Children.map( element.props.children, function( child ) {
			if ( ! React.isValidElement( child ) ) {
				return child;
			}

			return React.cloneElement( child, props );
		} );

		return React.DOM.div( null, childElements );
	}

	return React.cloneElement( element.props.children, props );
};
