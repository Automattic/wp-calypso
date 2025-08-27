/**
 * Playwright test fixture extension for Calypso E2E tests.
 *
 * This module extends the base Playwright test with custom fixtures and helpers
 * for Calypso E2E testing, including test accounts, page objects, API clients,
 * and environment variables.
 *
 * @remarks
 * - Provides fixtures for various test accounts, page objects, and utility classes.
 * - Ensures test accounts have fresh authentication cookies before use.
 * - Integrates Calypso-specific components and helpers for streamlined test authoring.
 *
 * @fixture accountGivenByEnvironment - A `TestAccount` determined by the current environment.
 * @fixture accountGutenbergSimple - A `TestAccount` for the Gutenberg Simple Site User.
 * @fixture accounti18n - A `TestAccount` for the i18n User.
 * @fixture clientEmail - An `EmailClient` instance for email-related test actions.
 * @fixture clientRestAPI - A `RestAPIClient` instance authenticated with the environment account.
 * @fixture componentBlockWidgetEditor - A `BlockWidgetEditorComponent` instance.
 * @fixture componentPreview - A `PreviewComponent` instance.
 * @fixture componentSidebar - A `SidebarComponent` instance.
 * @fixture componentSiteSelect - A `SiteSelectComponent` instance.
 * @fixture environment - The current environment variables.
 * @fixture helperData - The `DataHelper` utility.
 * @fixture pageAppleLogin - An `AppleLoginPage` instance.
 * @fixture pageDashboard - An `DashboardPage` instance.
 * @fixture pageEditor - An `EditorPage` instance.
 * @fixture pageLogin - A `LoginPage` instance.
 * @fixture pageThemeDetails - A `ThemesDetailPage` instance.
 * @fixture pageThemes - A `ThemesPage` instance.
 * @fixture secrets - The loaded secrets from `SecretsManager`.
 *
 * @example
 * ```typescript
 * test('should login and load editor', async ({ pageLogin, pageEditor }) => {
 *   await pageLogin.login('user', 'pass');
 *   await pageEditor.open();
 *   // ...test logic...
 * });
 * ```
 *
 * @see https://playwright.dev/docs/test-fixtures
 */
/* eslint-disable no-empty-pattern */
import {
	AppleLoginPage,
	BlockWidgetEditorComponent,
	DashboardPage,
	DataHelper,
	EditorPage,
	EmailClient,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	LoginPage,
	NewSiteResponse,
	PreviewComponent,
	RestAPIClient,
	Secrets,
	SecretsManager,
	SidebarComponent,
	SiteSelectComponent,
	TestAccount,
	ThemesDetailPage,
	ThemesPage,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { test as base, expect, Page } from '@playwright/test';
import { apiCloseAccount } from '../specs/shared';
import { getAccount } from './get_account';

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
	pageDashboard: DashboardPage;
	pageEditor: EditorPage;
	pageIncognito: Page;
	pageLogin: LoginPage;
	pageThemeDetails: ThemesDetailPage;
	pageThemes: ThemesPage;
	secrets: Secrets;
	siteNew: NewSiteResponse;
} >( {
	accountGivenByEnvironment: async ( { page }, use ) => {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		const testAccount = await getAccount( page, accountName );
		await use( testAccount );
	},
	accountGutenbergSimple: async ( { page }, use ) => {
		const testAccount = await getAccount( page, 'gutenbergSimpleSiteUser' );
		await use( testAccount );
	},
	accounti18n: async ( { page }, use ) => {
		const testAccount = await getAccount( page, 'i18nUser' );
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
	pageDashboard: async ( { page }, use ) => {
		const dashboardPage = new DashboardPage( page );
		await use( dashboardPage );
	},
	pageEditor: async ( { page }, use ) => {
		const editorPage = new EditorPage( page );
		await use( editorPage );
	},
	pageIncognito: async ( { browser }, use ) => {
		const context = await browser.newContext();
		const incognitoPage = await context.newPage();
		await use( incognitoPage );
		await context.close();
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
	siteNew: async ( { page, helperData }, use ) => {
		const testUser = helperData.getNewTestUser( { usernamePrefix: 'sitevisibility' } );
		const siteName = helperData.getBlogName();
		const loginPage = new LoginPage( page );
		await loginPage.visit();
		await loginPage.clickCreateNewAccount();
		const userSignupPage = new UserSignupPage( page );
		const newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
		const restAPIClient = new RestAPIClient(
			{ username: testUser.username, password: testUser.password },
			newUserDetails.body.bearer_token
		);
		const site = await restAPIClient.createSite( {
			name: siteName,
			title: siteName,
		} );
		await use( site );
		await restAPIClient.deleteSite( {
			id: site.blog_details.blogid,
			domain: site.blog_details.url,
		} );

		await apiCloseAccount( restAPIClient, {
			userID: newUserDetails.body.user_id,
			username: newUserDetails.body.username,
			email: testUser.email,
		} );
	},
} );

export { expect };
