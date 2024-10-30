import { __ } from '@wordpress/i18n';
import AdministrationSettings from 'calypso/my-sites/site-settings/administration';
import AgencySettings from 'calypso/my-sites/site-settings/agency';
import CachesSettings from 'calypso/my-sites/site-settings/caches';
import SiteSettings from 'calypso/my-sites/site-settings/site';
import WebServerSettings from 'calypso/my-sites/site-settings/web-server';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import makeSidebar, { PanelWithSidebar } from '../components/panel-sidebar';
import type { Context as PageJSContext } from '@automattic/calypso-router';

const SettingsSidebar = makeSidebar( {
	items: [
		{
			key: 'site',
			get label() {
				return __( 'Site' );
			},
		},
		{
			key: 'administration',
			get label() {
				return __( 'Administration' );
			},
			enabled: ( state ) => {
				const siteId = getSelectedSiteId( state );
				return ! isSiteWpcomStaging( state, siteId );
			},
		},
		{
			key: 'agency',
			get label() {
				return __( 'Agency' );
			},
		},
		{
			key: 'caches',
			get label() {
				return __( 'Caches' );
			},
		},
		{
			key: 'web-server',
			get label() {
				return __( 'Web Server' );
			},
		},
	],
} );

export function siteSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="site" context={ context } />
			<SiteSettings />
		</PanelWithSidebar>
	);
	next();
}

export function administrationSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="administration" context={ context } />
			<AdministrationSettings />
		</PanelWithSidebar>
	);
	next();
}

export function agencySettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="agency" context={ context } />
			<AgencySettings />
		</PanelWithSidebar>
	);
	next();
}

export function cachesSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="caches" context={ context } />
			<CachesSettings />
		</PanelWithSidebar>
	);
	next();
}

export function webServerSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="web-server" context={ context } />
			<WebServerSettings />
		</PanelWithSidebar>
	);
	next();
}
