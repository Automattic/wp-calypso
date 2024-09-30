import { Context as PageJSContext } from '@automattic/calypso-router';
import HostingOverview from 'calypso/hosting/overview/components/hosting-overview';
import HostingActivate from 'calypso/hosting/server-settings/hosting-activate';
import Hosting from 'calypso/hosting/server-settings/main';
import { getQueryArg } from '@wordpress/url';

export function hostingOverview( context: PageJSContext, next: () => void ) {
	const redirectToQueryParam = String( getQueryArg( context.path, 'redirect_to' ) );
	if ( redirectToQueryParam ) {
		return window.location.assign( redirectToQueryParam );
	}
	context.primary = <HostingOverview />;
	next();
}

export function hostingConfiguration( context: PageJSContext, next: () => void ) {
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
