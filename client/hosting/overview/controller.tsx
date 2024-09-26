import { Context as PageJSContext } from '@automattic/calypso-router';
import i18n from 'i18n-calypso';
import HostingOverview from 'calypso/hosting/overview/components/hosting-overview';
import HostingActivate from 'calypso/hosting/server-settings/hosting-activate';
import Hosting from 'calypso/hosting/server-settings/main';
import { successNotice } from 'calypso/state/notices/actions';

export function hostingOverview( context: PageJSContext, next: () => void ) {
	context.primary = <HostingOverview />;
	next();
}

export function hostingConfiguration( context: PageJSContext, next: () => void ) {
	// Update the url and show the notice after a redirect
	if ( context.query && context.query.hosting_features === 'activated' ) {
		context.store.dispatch(
			successNotice( i18n.translate( 'Hosting features activated successfully!' ), {
				displayOnNextPage: true,
			} )
		);
		// Remove query param without triggering a re-render
		const newUrl = new URL( window.location.href );
		newUrl.searchParams.delete( 'hosting_features' );
		window.history.replaceState( null, '', newUrl.toString() );
	}
	context.primary = (
		<div className="hosting-configuration">
			<Hosting />
		</div>
	);
	next();
}

export function hostingActivate( context: PageJSContext, next: () => void ) {
	context.primary = (
		<div className="hosting-configuration">
			<HostingActivate />
		</div>
	);
	next();
}
