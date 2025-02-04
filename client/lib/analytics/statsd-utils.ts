import config from '@automattic/calypso-config';
import superagent from 'superagent';

const IS_SERVER = typeof document === 'undefined';

interface BeaconBase {
	name: string;
	isLegacy?: boolean;
}

interface CountingBeacon extends BeaconBase {
	value?: number;
	type: 'counting';
}

interface TimingBeacon extends BeaconBase {
	value: number;
	type: 'timing';
}

export type BeaconData = CountingBeacon | TimingBeacon;

/**
 * Turns a beacon object into a string to send to boom.gif. The ultimate beacon
 * has a format with hierarchy encoded. An example result is:
 * "calypso.development.server.themes.$event:$value|$type"
 */
function createBeacon( calypsoSection: string, { name, value, type, isLegacy }: BeaconData ) {
	const event = name.replace( '-', '_' );

	// A counting event defaults to incrementing by one.
	if ( type === 'counting' ) {
		value ??= 1;
	}

	// There is an old response time event we don't want to change, unfortunately...
	// Otherwise, we want to encode "server" or "client" in the event.
	const hierarchyString = isLegacy ? '' : `.${ IS_SERVER ? 'server' : 'client' }`;

	return `calypso.${ config(
		'boom_analytics_key'
	) }${ hierarchyString }.${ calypsoSection }.${ event }:${ value }|${
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
 * config flag. Does nothing if called on the client.
 * @param calypsoSection The Calypso section the event occurred under.
 * @param events List of events to send to the server.
 */
export function logServerEvent( calypsoSection: string, events: BeaconData[] | BeaconData ) {
	calypsoSection ??= 'unknown';
	if ( typeof window === 'undefined' && config( 'server_side_boom_analytics_enabled' ) ) {
		superagent.get( createStatsdURL( calypsoSection, events ) ).end();
	}
}
