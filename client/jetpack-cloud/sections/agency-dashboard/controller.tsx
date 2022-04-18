import config from '@automattic/calypso-config';
import page from 'page';
import Header from './header';
import DashboardSidebar from './sidebar';
import SitesOverview from './sites-overview';

export function agencyDashboardContext( context: PageJS.Context, next: () => void ): void {
	if ( ! config.isEnabled( 'jetpack/agency-dashboard' ) ) {
		page.redirect( '/' );
		next();
	}

	context.header = <Header />;
	context.secondary = <DashboardSidebar path={ context.path } />;
	context.primary = <SitesOverview />;
	next();
}
