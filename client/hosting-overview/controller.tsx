import { Context as PageJSContext } from '@automattic/calypso-router';
import HostingOverview from 'calypso/hosting-overview/components/hosting-overview';

export function hostingOverview( context: PageJSContext, next: () => void ) {
	context.primary = <HostingOverview />;
	next();
}
