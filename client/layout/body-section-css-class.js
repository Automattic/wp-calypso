/**
 * External dependencies
 */
import React from 'react';

/*
 * React component that manages `is-section-*` and `is-group-*` class names on the <body>
 * element. When the `section` and `group` props get updated, it adds, removes and replaces
 * CSS classes accordingly.
 * TODO: reconsider if these classnames are really needed on <body> and whether having them
 * on `div.layout` could be sufficient to satisfy all theming and styling requirements.
 * `div.layout` has the advantage of being maintained by React, where class names can be
 * specified declaratively and the DOM diffing and patching is done by React itself.
 */
const patchBodyClass = toClass => ( next = null, prev = null ) => {
	if ( prev === next ) {
		return;
	}

	if ( prev ) {
		document.body.classList.remove( toClass( prev ) );
	}

	if ( next ) {
		document.body.classList.add( toClass( next ) );
	}
};

const patchGroupClass = patchBodyClass( g => `is-group-${ g }` );
const patchSectionClass = patchBodyClass( s => `is-section-${ s }` );

export default class BodySectionCssClass extends React.Component {
	componentDidMount() {
		patchGroupClass( this.props.group );
		patchSectionClass( this.props.section );
	}

	componentDidUpdate( prevProps ) {
		patchGroupClass( this.props.group, prevProps.group );
		patchSectionClass( this.props.section, prevProps.section );
	}

	render() {
		return null;
	}
}
