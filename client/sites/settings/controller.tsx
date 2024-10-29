import { __ } from '@wordpress/i18n';
import WpcomSiteTools from 'calypso/my-sites/site-settings/wpcom-site-tools';
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
			<WpcomSiteTools />
		</PanelWithSidebar>
	);
	next();
}

export function administrationSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="administration" />
			<WpcomSiteTools />
		</PanelWithSidebar>
	);
	next();
}

export function agencySettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="agency" />
			<WpcomSiteTools />
		</PanelWithSidebar>
	);
	next();
}

export function cachesSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="caches" />
			<WpcomSiteTools />
		</PanelWithSidebar>
	);
	next();
}

export function webServerSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="web-server" />
			<WpcomSiteTools />
		</PanelWithSidebar>
	);
	next();
}
