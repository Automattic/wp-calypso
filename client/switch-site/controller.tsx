import { SiteSwitch } from './components/site-switch';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export default function siteSwitcher( context: PageJSContext, next: () => void ) {
	context.primary = <SiteSwitch redirectTo={ context.query.route?.trim() ?? '' } />;
	next();
}
