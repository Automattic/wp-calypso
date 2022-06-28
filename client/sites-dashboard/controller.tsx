import { SitesDashboard } from './components/sites-dashboard';
import type { Context as PageJSContext } from 'page';
import './sites-dashboard.scss';

export function sitesDashboard( context: PageJSContext, next: () => void ) {
	context.primary = <SitesDashboard />;
	next();
}
