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
	context.primary = <AsyncLoad require={ loadConnectionsLandingView } placeholder={ null } />;
	next();
};

export const connectionsNew = ( context: Context, next: () => void ) => {
	if ( ! ensureUnifiedConnectionsEnabled() ) {
		return;
	}
	context.primary = <AsyncLoad require={ loadConnectionsNewView } placeholder={ null } />;
	next();
};
