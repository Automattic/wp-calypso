import { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';

const loadConnectionsNewView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-connections-new-view" */ 'calypso/reader/connections/connections-new-view'
	);
const loadPulseOverviewView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-pulse-overview-view" */ 'calypso/reader/connections/pulse-overview-view'
	);

export const connectionsLanding = ( context: Context, next: () => void ) => {
	context.primary = <AsyncLoad require={ loadPulseOverviewView } placeholder={ null } />;
	next();
};

export const connectionsNew = ( context: Context, next: () => void ) => {
	context.primary = <AsyncLoad require={ loadConnectionsNewView } placeholder={ null } />;
	next();
};
