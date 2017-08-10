/** @format */
/**
 * Internal dependencies
 */
import config from 'config';

export function statsdTimingUrl( featureSlug, eventType, duration ) {
	const slug = featureSlug.replace( /[.:-]/g, '_' );
	const type = eventType.replace( '-', '_' );
	const json = JSON.stringify( {
		beacons: [ `calypso.${ config( 'boom_analytics_key' ) }.${ slug }.${ type }:${ duration }|ms` ],
	} );

	const [ encodedSlug, jsonData ] = [ slug, json ].map( encodeURIComponent );
	return `https://pixel.wp.com/boom.gif?v=calypso&u=${ encodedSlug }&json=${ jsonData }`;
}
