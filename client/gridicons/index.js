/** @format */

/**
 * External dependencies
 */
import React from 'react';

export default function( { size, onClick, icon: iconProp, className, ...otherProps } ) {
	const icon = `gridicons-${ iconProp }`;
	const svg = require( `gridicons/svg-min/${ icon }.svg` );
	const klass = [ 'gridicon', icon, className ].filter( Boolean ).join( ' ' );

	return (
		<img alt="" src={ svg } className={ klass } height={ size } width={ size } { ...otherProps } />
	);
}
