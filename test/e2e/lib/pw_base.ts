/* eslint-disable no-empty-pattern */
import {
	AppleLoginPage,
	BlockWidgetEditorComponent,
	DataHelper,
	EditorPage,
	EmailClient,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	LoginPage,
	PreviewComponent,
	RestAPIClient,
	Secrets,
	SecretsManager,
	SidebarComponent,
	SiteSelectComponent,
	TestAccount,
	ThemesDetailPage,
	ThemesPage,
} from '@automattic/calypso-e2e';
import { test as base, expect } from '@playwright/test';

export const test = base.extend< {
	accountGivenByEnvironment: TestAccount;
	accountGutenbergSimple: TestAccount;
	accounti18n: TestAccount;
	clientEmail: EmailClient;
	clientRestAPI: RestAPIClient;
	componentBlockWidgetEditor: BlockWidgetEditorComponent;
	componentPreview: PreviewComponent;
	componentSidebar: SidebarComponent;
	componentSiteSelect: SiteSelectComponent;
	environment: typeof envVariables;
	helperData: typeof DataHelper;
	pageAppleLogin: AppleLoginPage;
	pageEditor: EditorPage;
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
	accounti18n: async ( { page }, use ) => {
		const accountName = 'i18nUser';
		const testAccount = new TestAccount( accountName );
		if ( ! ( await testAccount.hasFreshAuthCookies() ) ) {
			await testAccount.logInViaLoginPage( page );
			await testAccount.saveAuthCookies( page.context() );
		}
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
	helperData: async ( {}, use ) => {
		await use( DataHelper );
	},
	pageAppleLogin: async ( { page }, use ) => {
		const appleLoginPage = new AppleLoginPage( page );
		await use( appleLoginPage );
	},
	pageEditor: async ( { page }, use ) => {
		const editorPage = new EditorPage( page );
		await use( editorPage );
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
