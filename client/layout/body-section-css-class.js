/**
 * External dependencies
 */
import React from 'react';

/*
 * React component that manages `is-section-*` and `is-group-*` class names on the <body>
 * element. When the `section` and `group` props get updated, it adds, removes and replaces
 * CSS classes accordingly.
 *
 * TODO: reconsider if these classnames are really needed on <body> and whether having them
 * on `div.layout` could be sufficient to satisfy all theming and styling requirements.
 * `div.layout` has the advantage of being maintained by React, where class names can be
 * specified declaratively and the DOM diffing and patching is done by React itself.
 */
function useBodyClass( prefix, value ) {
	React.useEffect( () => {
		// if value is empty-ish, don't add or remove any CSS classes
		if ( ! value ) {
			return;
		}

		// Remove any existing classes with the same prefix, coming from example from a
		// server HTML markup. There should be max one class name with a gived `prefix`
		// at any one time. We're removing existing classes only when `value` is not `null`,
		// i.e., when we actually have a class name to add and want to prevent duplicate one.
		for ( const className of document.body.classList ) {
			if ( className.startsWith( prefix ) ) {
				document.body.classList.remove( className );
			}
		}

		// convert the value (section or group name) to a CSS class name
		const className = prefix + value;

		// add the CSS class to body when performing the effect
		document.body.classList.add( className );

		// remove the CSS class from body in the effect cleanup function
		return () => document.body.classList.remove( className );
	}, [ prefix, value ] );
}

export default function BodySectionCssClass( { group, section, bodyClass } ) {
	useBodyClass( 'is-group-', group );
	useBodyClass( 'is-section-', section );
	React.useEffect( () => {
		if ( ! Array.isArray( bodyClass ) || bodyClass.length === 0 ) {
			return;
		}

		bodyClass.forEach( ( className ) => {
			document.body.classList.add( className );
		} );

		return () => {
			bodyClass.forEach( ( className ) => {
				document.body.classList.remove( className );
			} );
		};
	}, [ bodyClass ] );

	return null;
}
