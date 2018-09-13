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
				import( /* webpackChunkName: "gridicons", webpackInclude: /\.js$/, webpackMode: "lazy-once" */ `gridicons/dist/${ icon }` ).then(
					g => callback( g.default )
				);
			} }
		/>
	);
}

export default AsyncGridicon;
