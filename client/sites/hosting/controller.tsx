import { Context as PageJSContext } from '@automattic/calypso-router';
import HostingFeatures from './components/hosting-features';

export function hostingFeatures( context: PageJSContext, next: () => void ) {
	context.primary = <HostingFeatures />;
	next();
}
