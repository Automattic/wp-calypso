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
import { getAccount } from './get-account';

export const test = base.extend< {
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
	 * Page object representing the WordPress editor page.
	 */
	pageEditor: EditorPage;
	/**
	 * Page object representing the WordPress.com login page.
	 */
	pageLogin: LoginPage;
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
