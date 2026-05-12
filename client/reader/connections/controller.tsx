import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';

const loadConnectionsLandingView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-connections-landing-view" */ 'calypso/reader/connections/connections-landing-view'
	);
const loadConnectionsNewView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-connections-new-view" */ 'calypso/reader/connections/connections-new-view'
	);
const loadPulseOverviewView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-pulse-overview-view" */ 'calypso/reader/connections/pulse-overview-view'
	);

/**
 * Guard the unified routes behind the flag. When the flag is off, fall
 * back to the existing per-protocol entry points by sending users to
 * `/reader`. The per-protocol routes still exist independently.
 */
function ensureUnifiedConnectionsEnabled(): boolean {
	if ( ! isEnabled( 'reader/unified-connections' ) ) {
		page.redirect( '/reader' );
		return false;
	}
	return true;
}

export const connectionsLanding = ( context: Context, next: () => void ) => {
	if ( ! ensureUnifiedConnectionsEnabled() ) {
		return;
	}
	// `reader/pulse-overview` is layered on top of the unified-connections
	// experiment: when on, `/reader/connections` becomes a real "Pulse"
	// overview surface (a grid of cards). When off, it keeps the original
	// redirect-on-load behaviour that bounces to the first connection or
	// to the chooser. AsyncLoad's `require` prop is lint-required to be a
	// top-level reference, so we branch on the flag at the JSX level
	// rather than mapping through a variable.
	if ( isEnabled( 'reader/pulse-overview' ) ) {
		context.primary = <AsyncLoad require={ loadPulseOverviewView } placeholder={ null } />;
	} else {
		context.primary = <AsyncLoad require={ loadConnectionsLandingView } placeholder={ null } />;
	}
	next();
};

export const connectionsNew = ( context: Context, next: () => void ) => {
	if ( ! ensureUnifiedConnectionsEnabled() ) {
		return;
	}
	context.primary = <AsyncLoad require={ loadConnectionsNewView } placeholder={ null } />;
	next();
};
