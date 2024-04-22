import HostingConfig from 'calypso/hosting-overview/components/hosting-config';
import HostingOverview from 'calypso/hosting-overview/components/hosting-overview';
import MySitesNavigation from 'calypso/my-sites/navigation';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function hostingOverview( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;

	context.primary = <HostingOverview />;

	next();
}

export function hostingConfig( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;

	context.primary = <HostingConfig />;

	next();
}
