/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import { needsOffset, needsOffsetX, needsOffsetY } from './icons-offset';

function AsyncGridicon( { icon = '', className, size = 24, ...rest } ) {
	const isModulo18 = s => s % 18 === 0;
	const classes = classnames( [ 'gridicon', `gridicons-${ icon }`, className ], {
		'needs-offset': needsOffset( icon ) && isModulo18( size ),
		'needs-offset-x': needsOffsetX( icon ) && isModulo18( size ),
		'needs-offset-y': needsOffsetY( icon ) && isModulo18( size ),
	} );
	return (
		<AsyncLoad
			require={ function( callback ) {
				import( /* webpackChunkName: "gridicons-[request]" */ `gridicons/svg-min/gridicons-${ icon }.svg` ).then(
					g => {
						callback( g.default ? g.default : g );
					}
				);
			} }
			placeholder={ null }
			className={ classes }
			height={ size }
			width={ size }
			{ ...rest }
		/>
	);
}

export default AsyncGridicon;
