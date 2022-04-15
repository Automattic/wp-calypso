import config from '@automattic/calypso-config';
import page from 'page';

export function agencyDashboardContext( context: PageJS.Context, next: () => void ): void {
	if ( ! config.isEnabled( 'jetpack/agency-dashboard' ) ) {
		page.redirect( '/' );
		next();
	}

	context.primary = <div>Agency dashboard placeholder</div>;
	next();
}
