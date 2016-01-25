
 /**
  * Internal dependencies
  */
import { isPostIdEndpoint } from 'lib/stats/endpoints';

function stringifyOptions( options = {} ) {
	return Object.keys( options ).sort().map( ( key ) => {
		const value = JSON.stringify( options[ key ] );
		return key + ( value ? '=' + value : '' );
	} ).join( '&' );
}

export function getCompositeKey( action ) {
	const { statType, siteID, postID, options } = action;
	const stringifiedOptions = stringifyOptions( options );
	return `${siteID}_${ postID || 0 }_${statType}_${stringifiedOptions}`;
}

export function normalizeParams( params ) {
	let { options, statType } = params;
	if ( isPostIdEndpoint( statType ) && options.post ) {
		return Object.assign( {}, params, {
			postID: options.post
		} );
	}

	return params;
}
