import { Children, isValidElement, cloneElement } from 'react';

export default function ( element, additionalProps ) {
	const props = { ...element.props, ...additionalProps };
	let childElements;

	delete props.children;

	if ( Children.count( element.props.children ) > 1 ) {
		childElements = Children.map( element.props.children, function ( child ) {
			if ( ! isValidElement( child ) ) {
				return child;
			}

			return cloneElement( child, props );
		} );

		return <div>{ childElements }</div>;
	}

	return cloneElement( element.props.children, props );
}
