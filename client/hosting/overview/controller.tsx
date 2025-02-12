import { Context as PageJSContext } from '@automattic/calypso-router';
import { removeQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import HostingActivate from 'calypso/hosting/server-settings/hosting-activate';
import Hosting from 'calypso/hosting/server-settings/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { PanelWithSidebar } from 'calypso/sites/components/panel-sidebar';
import HostingOverview from 'calypso/sites/overview/components/hosting-overview';
import { SettingsSidebar } from 'calypso/sites/settings/controller';
import { successNotice } from 'calypso/state/notices/actions';

export function hostingOverview( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/overview/:site" title="Site Overview" />
			<HostingOverview />
		</>
	);
	next();
}

export async function hostingConfiguration( context: PageJSContext, next: () => void ) {
	// Update the url and show the notice after a redirect
	if ( context.query && context.query.hosting_features === 'activated' ) {
		context.store.dispatch(
			successNotice( i18n.translate( 'Hosting features activated successfully!' ), {
				displayOnNextPage: true,
			} )
		);
		// Remove query param without triggering a re-render
		window.history.replaceState(
			null,
			'',
			removeQueryArgs( window.location.href, 'hosting_features' )
		);
	}
	const isUntangled = await isRemoveDuplicateViewsExperimentEnabled( context.store.getState() );
	context.primary = isUntangled ? (
		<PanelWithSidebar>
			<SettingsSidebar />
			<div className="hosting-configuration">
				<Hosting />
			</div>
		</PanelWithSidebar>
	) : (
		<div className="hosting-configuration">
			<Hosting />
		</div>
	);
	next();
}

export async function hostingActivate( context: PageJSContext, next: () => void ) {
	const isUntangled = await isRemoveDuplicateViewsExperimentEnabled( context.store.getState() );
	context.primary = isUntangled ? (
		<PanelWithSidebar>
			<SettingsSidebar />
			<div className="hosting-configuration">
				<HostingActivate />
			</div>
		</PanelWithSidebar>
	) : (
		<div className="hosting-configuration">
			<HostingActivate />
		</div>
	);
	next();
}
