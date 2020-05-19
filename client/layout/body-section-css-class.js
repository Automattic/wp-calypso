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
const addBodyClass = ( toClass ) => ( value ) => () => {
	// if value is empty-ish, don't add any CSS classes
	if ( ! value ) {
		return;
	}

	// convert the value (section or group name) to a CSS class name
	const className = toClass( value );

	// add the CSS class to body when performing the effect
	document.body.classList.add( className );

	// remove the CSS class from body in the effect cleanup function
	return () => document.body.classList.remove( className );
};

// two effect creators for groups and sections
const addGroupClass = addBodyClass( ( g ) => `is-group-${ g }` );
const addSectionClass = addBodyClass( ( s ) => `is-section-${ s }` );

export default function BodySectionCssClass( { group, section, bodyClass } ) {
	React.useEffect( addGroupClass( group ), [ group ] );
	React.useEffect( addSectionClass( section ), [ section ] );
	React.useEffect( () => bodyClass && document.body.classList.add( bodyClass ) );

	return null;
}
