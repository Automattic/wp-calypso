import { Context as PageJSContext } from '@automattic/calypso-router';
import HostingOverview from 'calypso/hosting-overview/components/hosting-overview';
import HostingActivate from 'calypso/my-sites/hosting/hosting-activate';
import Hosting from 'calypso/my-sites/hosting/main';
import MySitesNavigation from 'calypso/my-sites/navigation';

export function hostingOverview( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = <HostingOverview />;
	next();
}

export function hostingConfiguration( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = (
		<div className="hosting-configuration">
			<Hosting />
		</div>
	);
	next();
}

export function hostingActivate( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;
	context.primary = (
		<div className="hosting-configuration">
			<HostingActivate />
		</div>
	);
	next();
}
