/**
 * External dependencies
 */

import { assign } from 'lodash';
import React from 'react';

export default function ( element, additionalProps ) {
	let props = assign( {}, element.props, additionalProps ),
		childElements;

	delete props.children;

	if ( React.Children.count( element.props.children ) > 1 ) {
		childElements = React.Children.map( element.props.children, function ( child ) {
			if ( ! React.isValidElement( child ) ) {
				return child;
			}

			return React.cloneElement( child, props );
		} );

		return <div>{ childElements }</div>;
	}

	return React.cloneElement( element.props.children, props );
}
