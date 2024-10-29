import { __ } from '@wordpress/i18n';
import WpcomSiteTools from 'calypso/my-sites/site-settings/wpcom-site-tools';
import makeSidebar, { PanelWithSidebar } from '../components/panel-sidebar';
import type { Context as PageJSContext } from '@automattic/calypso-router';

const SettingsSidebar = makeSidebar( {
	items: [
		{
			key: 'settings',
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
	],
} );

export function siteSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="settings" />
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
