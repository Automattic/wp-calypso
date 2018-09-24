/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import FallbackIcon from './fallback';

function AsyncGridicon( { icon = '', ...rest } ) {
	return (
		<AsyncLoad
			require={ function( callback ) {
				import( /* webpackChunkName: "gridicons-[request]" */ `gridicons/dist/${ icon }` )
					.then( g => callback( g.default ) )
					.catch( err => {
						console.warn( `Error loading icon '${ icon }':`, err.message ); // eslint-disable-line no-console
						callback( FallbackIcon );
					} );
			} }
			placeholder={ null }
			{ ...rest }
		/>
	);
}

export default AsyncGridicon;
