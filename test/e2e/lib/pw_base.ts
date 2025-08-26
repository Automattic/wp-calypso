/* eslint-disable no-empty-pattern */
import {
	AppleLoginPage,
	EmailClient,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	LoginPage,
	PreviewComponent,
	Secrets,
	SecretsManager,
	SidebarComponent,
	SiteSelectComponent,
	TestAccount,
	ThemesDetailPage,
	ThemesPage,
	BlockWidgetEditorComponent,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { test as base, expect } from '@playwright/test';

export const test = base.extend< {
	accountGivenByEnvironment: TestAccount;
	accountGutenbergSimple: TestAccount;
	clientEmail: EmailClient;
	clientRestAPI: RestAPIClient;
	componentBlockWidgetEditor: BlockWidgetEditorComponent;
	componentPreview: PreviewComponent;
	componentSidebar: SidebarComponent;
	componentSiteSelect: SiteSelectComponent;
	environment: typeof envVariables;
	pageAppleLogin: AppleLoginPage;
	pageLogin: LoginPage;
	pageThemeDetails: ThemesDetailPage;
	pageThemes: ThemesPage;
	secrets: Secrets;
} >( {
	accountGivenByEnvironment: async ( {}, use ) => {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		const testAccount = new TestAccount( accountName );
		await use( testAccount );
	},
	accountGutenbergSimple: async ( {}, use ) => {
		const accountName = 'gutenbergSimpleSiteUser';
		const testAccount = new TestAccount( accountName );
		await use( testAccount );
	},
	clientEmail: async ( {}, use ) => {
		const emailClient = new EmailClient();
		await use( emailClient );
	},
	clientRestAPI: async ( { accountGivenByEnvironment }, use ) => {
		const restAPIClient = new RestAPIClient( accountGivenByEnvironment.credentials );
		await use( restAPIClient );
	},
	componentBlockWidgetEditor: async ( { page }, use ) => {
		const blockWidgetEditorComponent = new BlockWidgetEditorComponent( page );
		await use( blockWidgetEditorComponent );
	},
	componentPreview: async ( { page }, use ) => {
		const previewComponent = new PreviewComponent( page );
		await use( previewComponent );
	},
	componentSidebar: async ( { page }, use ) => {
		const sidebarComponent = new SidebarComponent( page );
		await use( sidebarComponent );
	},
	componentSiteSelect: async ( { page }, use ) => {
		const siteSelectComponent = new SiteSelectComponent( page );
		await use( siteSelectComponent );
	},
	environment: async ( {}, use ) => {
		await use( envVariables );
	},
	pageAppleLogin: async ( { page }, use ) => {
		const appleLoginPage = new AppleLoginPage( page );
		await use( appleLoginPage );
	},
	pageLogin: async ( { page }, use ) => {
		const loginPage = new LoginPage( page );
		await use( loginPage );
	},
	pageThemeDetails: async ( { page }, use ) => {
		const themesDetailPage = new ThemesDetailPage( page );
		await use( themesDetailPage );
	},
	pageThemes: async ( { page }, use ) => {
		const themesPage = new ThemesPage( page );
		await use( themesPage );
	},
	secrets: async ( {}, use ) => {
		const secrets = SecretsManager.secrets;
		await use( secrets );
	},
} );

export { expect };
