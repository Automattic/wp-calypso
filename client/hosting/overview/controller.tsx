import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { removeQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import Hosting from 'calypso/hosting/server-settings/main';
import { PanelWithSidebar } from 'calypso/sites/components/panel-sidebar';
import { SettingsSidebar } from 'calypso/sites/settings/controller';
import { successNotice } from 'calypso/state/notices/actions';

export async function hostingConfiguration( context: PageJSContext, next: () => void ) {
	const { dispatch } = context.store;

	// Update the url and show the notice after a redirect
	if ( context.query && context.query.hosting_features === 'activated' ) {
		dispatch(
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

	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<div className="hosting-configuration">
				<Hosting />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export async function redirectToServerSettingsIfDuplicatedView( context: PageJSContext ) {
	return page.redirect( `/sites/settings/server/${ context.params.site_id }` );
}
