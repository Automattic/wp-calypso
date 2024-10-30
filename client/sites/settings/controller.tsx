import { __ } from '@wordpress/i18n';
import AdministrationSettings from 'calypso/my-sites/site-settings/administration';
import AgencySettings from 'calypso/my-sites/site-settings/agency';
import CachesSettings from 'calypso/my-sites/site-settings/caches';
import SiteSettings from 'calypso/my-sites/site-settings/site';
import WebServerSettings from 'calypso/my-sites/site-settings/web-server';
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
			<SettingsSidebar selectedItemKey="site" />
			<SiteSettings />
		</PanelWithSidebar>
	);
	next();
}

export function administrationSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="administration" />
			<AdministrationSettings />
		</PanelWithSidebar>
	);
	next();
}

export function agencySettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="agency" />
			<AgencySettings />
		</PanelWithSidebar>
	);
	next();
}

export function cachesSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="caches" />
			<CachesSettings />
		</PanelWithSidebar>
	);
	next();
}

export function webServerSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="web-server" />
			<WebServerSettings />
		</PanelWithSidebar>
	);
	next();
}
