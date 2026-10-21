import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';

const loadConnectionsNewView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-connections-new-view" */ 'calypso/reader/connections/connections-new-view'
	);
const loadSocialOverviewView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-social-overview-view" */ 'calypso/reader/connections/social-overview-view'
	);

function ensureSocialEnabled(): boolean {
	if ( ! isEnabled( 'reader/social' ) ) {
		page.redirect( '/reader' );
		return false;
	}
	return true;
}

export const connectionsLanding = ( context: Context, next: () => void ) => {
	if ( ! ensureSocialEnabled() ) {
		return;
	}
	context.primary = <AsyncLoad require={ loadSocialOverviewView } placeholder={ null } />;
	next();
};

export const connectionsNew = ( context: Context, next: () => void ) => {
	if ( ! ensureSocialEnabled() ) {
		return;
	}
	context.primary = <AsyncLoad require={ loadConnectionsNewView } placeholder={ null } />;
	next();
};
