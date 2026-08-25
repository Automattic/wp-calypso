import type { BuildWowFeedDelta } from './build-feed';

// Developer instrumentation for the live-build feed. Nothing on the waiting
// screen renders these events yet, so the console is the only place the data
// surfaces — and it surfaces whole. One group per delta, then every event
// object and every asset in full, then the raw delta underneath so a field the
// backend adds later shows up without this file knowing about it.
//
// Nothing here is condensed: reading a value to shorten it is how the console
// stops being the source of truth, and defensively reading a value that is
// only ever handed to console.log buys nothing that console.log does not
// already survive on its own.

const RUN_LABEL_LENGTH = 8;
const HEADLINE_STYLE = 'color:#3858e9;font-weight:600';

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
	console.group( `%c${ headline }`, HEADLINE_STYLE );

	for ( const event of events ) {
		console.log(
			`#${ event.seq } ${ event.type }${ event.key ? ` · ${ event.key }` : '' }`,
			event
		);
	}

	for ( const [ name, content ] of assets ) {
		console.log( `asset ${ name }`, content );
	}

	console.log( 'delta', delta );
	console.groupEnd();
	/* eslint-enable no-console */
}
