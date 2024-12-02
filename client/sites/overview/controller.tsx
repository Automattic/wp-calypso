import HostingOverview from './components/hosting-overview';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function overview( context: PageJSContext, next: () => void ) {
	context.primary = <HostingOverview />;
	next();
}
