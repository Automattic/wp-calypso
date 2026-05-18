import { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';

const loadConnectionsNewView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-connections-new-view" */ 'calypso/reader/connections/connections-new-view'
	);
const loadSocialOverviewView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-social-overview-view" */ 'calypso/reader/connections/social-overview-view'
	);

export const connectionsLanding = ( context: Context, next: () => void ) => {
	context.primary = <AsyncLoad require={ loadSocialOverviewView } placeholder={ null } />;
	next();
};

export const connectionsNew = ( context: Context, next: () => void ) => {
	context.primary = <AsyncLoad require={ loadConnectionsNewView } placeholder={ null } />;
	next();
};
