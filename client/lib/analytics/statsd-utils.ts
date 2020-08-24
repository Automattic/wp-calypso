/**
 * Internal dependencies
 */
import config from 'config';

function generateUrl( featureSlug: string, eventType: string, eventValue: string ) {
	const slug = featureSlug.replace( /[.:-]/g, '_' );
	const type = eventType.replace( '-', '_' );
	const json = JSON.stringify( {
		beacons: [ `calypso.${ config( 'boom_analytics_key' ) }.${ slug }.${ type }:${ eventValue }` ],
	} );

	const [ encodedSlug, jsonData ] = [ slug, json ].map( encodeURIComponent );
	return `https://pixel.wp.com/boom.gif?v=calypso&u=${ encodedSlug }&json=${ jsonData }`;
}

export function statsdTimingUrl( featureSlug: string, eventType: string, duration: number ) {
	return generateUrl( featureSlug, eventType, `${ duration }|ms` );
}

export function statsdCountingUrl( featureSlug: string, eventType: string, increment: number ) {
	return generateUrl( featureSlug, eventType, `${ increment }|c` );
}
