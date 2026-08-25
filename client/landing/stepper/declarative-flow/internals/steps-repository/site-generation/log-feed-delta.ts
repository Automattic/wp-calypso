import type { BuildWowFeedDelta, BuildWowFeedEvent } from './build-feed';

// Developer instrumentation for the live-build feed. Nothing on the waiting
// screen renders these events yet, so the console is the only place the data
// surfaces: one collapsed group per delta, a table of what arrived, and the
// raw payload underneath for expansion.
//
// Every read is defensive. The payloads are server-capped plain text derived
// from model output, and a surprising shape must cost a log line, never the
// build screen — the reader wraps this call, but it should not need to.

const RUN_LABEL_LENGTH = 8;
const HEADLINE_STYLE = 'color:#3858e9;font-weight:600';

const asText = ( value: unknown ): string => ( typeof value === 'string' ? value : '' );

const countOf = ( value: unknown ): number => ( Array.isArray( value ) ? value.length : 0 );

function summarize( event: BuildWowFeedEvent ): string {
	const data = event.data ?? {};

	switch ( event.type ) {
		case 'identity':
			return asText( data.title );
		case 'design_direction':
			return [ asText( data.title ), asText( data.heading_font ) ].filter( Boolean ).join( ' · ' );
		case 'palette':
			return `${ countOf( data.colors ) } colors`;
		case 'fonts':
			return `${ countOf( data.families ) } families`;
		case 'page_plan':
			return ( Array.isArray( data.pages ) ? data.pages : [] )
				.map( ( page ) => asText( ( page as Record< string, unknown > )?.title ) )
				.filter( Boolean )
				.join( ', ' );
		case 'plan_keys':
			return `${ countOf( data.keys ) } parts planned`;
		case 'section':
			return asText( data.heading ) || asText( data.section ) || asText( event.key );
		case 'images_planned':
			return `${ typeof data.count === 'number' ? data.count : countOf( data.subjects ) } images`;
		case 'design_asset':
			return asText( data.ref );
		default:
			return '';
	}
}

function describeAsset( name: string, content: unknown ): string {
	const size = typeof content === 'string' ? content.length : 0;
	return `${ name } — ${ ( size / 1024 ).toFixed( 1 ) } KB`;
}

export function logBuildWowFeedDelta( delta: BuildWowFeedDelta ): void {
	const events = delta.events ?? [];
	const assets = Object.entries( delta.assets ?? {} );
	const run = ( delta.run_id ?? '' ).slice( 0, RUN_LABEL_LENGTH ) || 'unknown';
	const headline = delta.reset
		? `Big Sky live-build feed · run ${ run } · superseded, replaying from the start`
		: `Big Sky live-build feed · run ${ run } · seq ${ delta.latest_seq ?? 0 } · ${
				events.length
		  } event${ events.length === 1 ? '' : 's' }`;

	/* eslint-disable no-console -- the whole point of this module. */
	console.groupCollapsed( `%c${ headline }`, HEADLINE_STYLE );

	if ( events.length ) {
		console.table(
			events.map( ( event ) => ( {
				seq: event.seq,
				type: event.type,
				key: event.key ?? '',
				summary: summarize( event ),
			} ) )
		);
	}

	for ( const [ name, content ] of assets ) {
		console.log( describeAsset( name, content ) );
	}

	console.log( delta );
	console.groupEnd();
	/* eslint-enable no-console */
}
