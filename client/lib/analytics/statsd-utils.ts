import config from '@automattic/calypso-config';

interface BeaconData {
	name: string;
	value: number;
	type: 'counting' | 'timing';
}

function createBeacon( calypsoSection: string, { name, value, type }: BeaconData ) {
	const section = calypsoSection.replace( /[.:-]/g, '_' );
	const event = name.replace( '-', '_' );

	// A counting event defaults to incrementing by one.
	if ( type === 'counting' && value == null ) {
		value = 1;
	}

	return `calypso.${ config( 'boom_analytics_key' ) }.${ section }.${ event }:${ value }|${
		type === 'timing' ? 'ms' : 'c'
	}`;
}

export function createStatsdURL( calypsoSection: string, events: BeaconData[] ) {
	const json = JSON.stringify( {
		beacons: events.map( ( event ) => createBeacon( calypsoSection, event ) ),
	} );

	const [ encodedSection, encodedJson ] = [ calypsoSection, json ].map( encodeURIComponent );

	// While the `u` parameter is typically the URL, the original statsd code in Calypso
	// used just the section name everywhere. To keep things consistent, we continue
	// to use just the section name today.
	return `https://pixel.wp.com/boom.gif?v=calypso&u=${ encodedSection }&json=${ encodedJson }`;
}
