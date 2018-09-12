/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';

function AsyncGridicon( { icon = '' } ) {
	return (
		<AsyncLoad
			require={ function( callback ) {
				import( /* webpackChunkName: "gridicons-[request]" */ `gridicons/dist/${ icon }` ).then(
					g => callback( g.default )
				);
			} }
		/>
	);
}

export default AsyncGridicon;
