import { __ } from '@wordpress/i18n';
import CacheCard from 'calypso/hosting/server-settings/components/cache-card';
import DefensiveModeCard from 'calypso/hosting/server-settings/components/defensive-mode-card';
import WebServerSettingsCard from 'calypso/hosting/server-settings/components/web-server-settings-card';
import { A4AFullyManagedSiteSetting } from 'calypso/my-sites/site-settings/a4a-fully-managed-site-setting';
import SiteSettingGeneral from 'calypso/my-sites/site-settings/form-general';
import SiteTools from 'calypso/my-sites/site-settings/site-tools';
import makeSidebar, { PanelWithSidebar } from '../components/panel-sidebar';
import type { Context as PageJSContext } from '@automattic/calypso-router';

import 'calypso/my-sites/marketing/style.scss';

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
				return __( 'Web server' );
			},
		},
	],
} );

export function site( context: PageJSContext, next: () => void ) {
	const props = {
		selectedSite: {},
		translate: ( x ) => x,
		onChangeField: () => ( z ) => z,
		handleToggle: () => ( z ) => z,
		eventTracker: () => ( z ) => z,
		trackEvent: () => ( z ) => z,
		updateFields: () => ( z ) => z,
		uniqueEventTracker: () => ( z ) => z,
		fields: {},
		siteId: 1234,
		site: {
			ID: 1234,
			plan: { product_slug: 'business' },
			domain: 'example.wpcomstaging.com',
		},
		siteDomains: [],
		siteIsAtomic: true,
		siteIsJetpack: true,
		siteIsP2Hub: false,
		isAtomicAndEditingToolkitDeactivated: false,
		isWPForTeamsSite: false,
		isWpcomStagingSite: false,
		updateFields: () => {},
		isComingSoon: false,
		isUnlaunchedSite: false,
		fields: {
			wpcom_public_coming_soon: 0,
			wpcom_coming_soon: 0,
			blog_public: 0,
		},
	};
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="site" />
			<div style={ { width: '100%' } }>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>Site</h1>
				<SiteSettingGeneral />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function administration( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="administration" />
			<div style={ { width: '100%' } }>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>
					Administration
				</h1>
				<SiteTools />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function agency( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="agency" />
			<div>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>Agency</h1>
				<A4AFullyManagedSiteSetting />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function caches( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="caches" />
			<div>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>Caches</h1>
				<CacheCard />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function webServer( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar selectedItemKey="web-server" />
			<div>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>Web Server</h1>
				<WebServerSettingsCard />
				<DefensiveModeCard />
			</div>
		</PanelWithSidebar>
	);
	next();
}
