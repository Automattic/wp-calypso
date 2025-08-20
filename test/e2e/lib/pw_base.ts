/* eslint-disable no-empty-pattern */
import {
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	PreviewComponent,
	SidebarComponent,
	SiteSelectComponent,
	TestAccount,
	ThemesDetailPage,
	ThemesPage,
} from '@automattic/calypso-e2e';
import { test as base } from '@playwright/test';

export const test = base.extend< {
	accountGutenbergSimple: TestAccount;
	accountGivenByEnvironment: TestAccount;
	componentSidebar: SidebarComponent;
	componentSiteSelect: SiteSelectComponent;
	pageThemes: ThemesPage;
	pageThemeDetails: ThemesDetailPage;
	componentPreview: PreviewComponent;
} >( {
	accountGutenbergSimple: async ( {}, use ) => {
		const accountName = 'gutenbergSimpleSiteUser';
		const testAccount = new TestAccount( accountName );
		await use( testAccount );
	},
	accountGivenByEnvironment: async ( {}, use ) => {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		const testAccount = new TestAccount( accountName );
		await use( testAccount );
	},
	componentSidebar: async ( { page }, use ) => {
		const sidebarComponent = new SidebarComponent( page );
		await use( sidebarComponent );
	},
	componentSiteSelect: async ( { page }, use ) => {
		const siteSelectComponent = new SiteSelectComponent( page );
		await use( siteSelectComponent );
	},
	pageThemes: async ( { page }, use ) => {
		const themesPage = new ThemesPage( page );
		await use( themesPage );
	},
	pageThemeDetails: async ( { page }, use ) => {
		const themesDetailPage = new ThemesDetailPage( page );
		await use( themesDetailPage );
	},
	componentPreview: async ( { page }, use ) => {
		const previewComponent = new PreviewComponent( page );
		await use( previewComponent );
	},
} );
