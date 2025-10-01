/**
 * Playwright test fixture extension for Calypso E2E tests.
 *
 * This module extends the base Playwright test with custom fixtures and helpers
 * for Calypso E2E testing, including test accounts, page objects, API clients,
 * and environment variables.
 *
 * - Provides fixtures for various test accounts, page objects, and utility classes.
 * - Ensures test accounts have fresh authentication cookies before use.
 * - Integrates Calypso-specific components and helpers for streamlined test authoring.
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
	DashboardVisibilitySettingsPage,
	DataHelper,
	EditorPage,
	EmailClient,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	GitHubLoginPage,
	IncognitoPage,
	JetpackTrafficPage,
	LoginPage,
	MarketingPage,
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
import { test as base, expect } from '@playwright/test';
import { apiCloseAccount } from '../specs/shared';
import { getAccount } from './get-account';

export const test = base.extend< {
	/**
	 * Test account used to test atomic sites (Business plans)
	 */
	accountAtomic: TestAccount;
	/**
	 * Test account selected based on the current environment variables.
	 */
	accountGivenByEnvironment: TestAccount;
	/**
	 * Test account with a simple Gutenberg site.
	 */
	accountGutenbergSimple: TestAccount;
	/**
	 * Test account used for i18n locale switching.
	 */
	accounti18n: TestAccount;
	/**
	 * Test account used to test atomic sites (Business plans)
	 */
	accountSimpleSiteFreePlan: TestAccount;
	/**
	 * Test account used for SMS-based 2FA.
	 */
	accountSMS: TestAccount;
	/**
	 * Client for interacting with emails during tests.
	 */
	clientEmail: EmailClient;
	/**
	 * Client for interacting with the WordPress.com REST API.
	 */
	clientRestAPI: RestAPIClient;
	/**
	 * Component for interacting with the block widget editor.
	 */
	componentBlockWidgetEditor: BlockWidgetEditorComponent;
	/**
	 * Component for interacting with the preview functionality.
	 */
	componentPreview: PreviewComponent;
	/**
	 * Component for interacting with the sidebar functionality.
	 */
	componentSidebar: SidebarComponent;
	/**
	 * Component for interacting with the site selection functionality.
	 */
	componentSiteSelect: SiteSelectComponent;
	/**
	 * Environment variables for the tests.
	 */
	environment: typeof envVariables;
	/**
	 * Helper data and utilities for tests.
	 */
	helperData: typeof DataHelper;
	/**
	 * Page object representing the Apple login page.
	 */
	pageAppleLogin: AppleLoginPage;
	/**
	 * Page object representing the WordPress.com dashboard.
	 */
	pageDashboard: DashboardPage;
	/**
	 * Page object representing the WordPress.com dashboard visibility settings page.
	 */
	pageDashboardVisibilitySettings: DashboardVisibilitySettingsPage;
	/**
	 * Page object representing the WordPress editor page.
	 */
	pageEditor: EditorPage;
	/**
	 * Page object representing the Github login page.
	 */
	pageGitHubLogin: GitHubLoginPage;
	/**
	 * Playwright `Page` representing an incognito browser context with no signed in state.
	 */
	pageIncognito: IncognitoPage;
	/**
	 * Page object representing the Jetpack Traffic Page
	 */
	pageJetpackTraffic: JetpackTrafficPage;
	/**
	 * Page object representing the WordPress.com login page.
	 */
	pageLogin: LoginPage;
	/**
	 * Page object representing the WordPress.com marketing page.
	 */
	pageMarketing: MarketingPage;
	/**
	 * Page object representing the WordPress.com themes detail page.
	 */
	pageThemeDetails: ThemesDetailPage;
	/**
	 * Page object representing the WordPress.com themes listing page.
	 */
	pageThemes: ThemesPage;
	/**
	 * Secrets needed for end-to-end tests.
	 */
	secrets: Secrets;
	/**
	 * Creates a new site with public visibility for testing.
	 */
	sitePublic: NewSiteResponse;
} >( {
	accountAtomic: async ( { page }, use ) => {
		const testAccount = await getAccount( page, 'atomicUser' );
		await use( testAccount );
	},
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
	accountSimpleSiteFreePlan: async ( { page }, use ) => {
		const testAccount = await getAccount( page, 'simpleSiteFreePlanUser' );
		await use( testAccount );
	},
	accountSMS: async ( { page }, use ) => {
		const testAccount = await getAccount( page, 'smsUser' );
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
	pageDashboardVisibilitySettings: async ( { page }, use ) => {
		const dashboardVisibilitySettingsPage = new DashboardVisibilitySettingsPage( page );
		await use( dashboardVisibilitySettingsPage );
	},
	pageEditor: async ( { page }, use ) => {
		const editorPage = new EditorPage( page );
		await use( editorPage );
	},
	pageGitHubLogin: async ( { page }, use ) => {
		const gitHubLoginPage = new GitHubLoginPage( page );
		await use( gitHubLoginPage );
	},
	pageIncognito: async ( { browser }, use ) => {
		const incognitoPage = new IncognitoPage( browser );
		await incognitoPage.spawn();
		await use( incognitoPage );
		await incognitoPage.close();
	},
	pageJetpackTraffic: async ( { page }, use ) => {
		const jetpackTrafficPage = new JetpackTrafficPage( page );
		await use( jetpackTrafficPage );
	},
	pageLogin: async ( { page }, use ) => {
		const loginPage = new LoginPage( page );
		await use( loginPage );
	},
	pageMarketing: async ( { page }, use ) => {
		const marketingPage = new MarketingPage( page );
		await use( marketingPage );
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
	sitePublic: async ( { page, helperData }, use ) => {
		const testUser = helperData.getNewTestUser();
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

export const tags = {
	A8C_FOR_AGENCIES: '@a8c-for-agencies',
	AUTHENTICATION: '@authentication',
	CALYPSO_PR: '@calypso-pr',
	CALYPSO_RELEASE: '@calypso-release',
	DASHBOARD: '@dashboard',
	EXAMPLE_BLOCKS: '@example-blocks',
	GUTENBERG: '@gutenberg',
	I18N: '@i18n',
	JETPACK_REMOTE_SITE: '@jetpack-remote-site',
	JETPACK_WPCOM_INTEGRATION: '@jetpack-wpcom-integration',
	LEGAL: '@legal',
	P2: '@p2',
	SETTINGS: '@settings',
};

export { expect };
