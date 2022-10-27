import config from '@automattic/calypso-config';
import superagent from 'superagent';

interface CountingBeacon {
	name: string;
	value?: number;
	type: 'counting';
}

interface TimingBeacon {
	name: string;
	value: number;
	type: 'timing';
}

export type BeaconData = CountingBeacon | TimingBeacon;

function createBeacon( calypsoSection: string, { name, value, type }: BeaconData ) {
	const event = name.replace( '-', '_' );

	// A counting event defaults to incrementing by one.
	if ( type === 'counting' ) {
		value ??= 1;
	}

	return `calypso.${ config( 'boom_analytics_key' ) }.${ calypsoSection }.${ event }:${ value }|${
		type === 'timing' ? 'ms' : 'c'
	}`;
}

export function createStatsdURL( calypsoSection: string, events: BeaconData[] | BeaconData ) {
	if ( ! Array.isArray( events ) ) {
		events = [ events ]; // Only a single event was passed to process.
	}

	const section = calypsoSection.replace( /[.:-]/g, '_' );
	const json = JSON.stringify( {
		beacons: events.map( ( event ) => createBeacon( section, event ) ),
	} );

	const [ encodedSection, encodedJson ] = [ section, json ].map( encodeURIComponent );

	// While the `u` parameter is typically the URL, the original statsd code in Calypso
	// used just the section name everywhere. To keep things consistent, we continue
	// to use just the section name today.
	return `https://pixel.wp.com/boom.gif?v=calypso&u=${ encodedSection }&json=${ encodedJson }`;
}

/**
 * Logs server events to statsd. Uses superagent for server-side network requests
 * and can disable statsd events with the server_side_boom_analytics_enabled
 * config flag.
 *
 * @param calypsoSection The Calypso section the event occurred under.
 * @param events List of events to send to the server.
 */
export function logServerEvent( calypsoSection: string, events: BeaconData[] | BeaconData ) {
	if ( config( 'server_side_boom_analytics_enabled' ) ) {
		superagent.get( createStatsdURL( calypsoSection, events ) ).end();
	}
}
