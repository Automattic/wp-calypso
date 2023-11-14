import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { BrowserContext, Page } from 'playwright';
import { TestAccountName } from '..';
import { getAccountSiteURL, getCalypsoURL } from '../data-helper';
import { EmailClient } from '../email-client';
import envVariables from '../env-variables';
import { SecretsManager } from '../secrets';
import { TOTPClient } from '../totp-client';
import { SidebarComponent } from './components/sidebar-component';
import { LoginPage } from './pages/login-page';
import { WpAdminDashboardPage } from './pages/wp-admin/wp-admin-dashboard-page';
import type { TestAccountCredentials } from '../secrets';

/**
 * Represents the WPCOM test account.
 */
export class TestAccount {
	readonly accountName: TestAccountName;
	readonly credentials: TestAccountCredentials;

	/**
	 * Constructs an instance of the TestAccount for the given account name.
	 * Available test accounts should be defined in the e2e secrets file.
	 */
	constructor( accountName: TestAccountName ) {
		this.accountName = accountName;
		this.credentials = SecretsManager.secrets.testAccounts[ accountName ];
	}

	/**
	 * Authenticates the account using previously saved cookies or via the login
	 * page UI if cookies are unavailable.
	 *
	 * @param {Page} page Page object.
	 * @param {string} [url] URL to expect once authenticated and redirections are finished.
	 */
	async authenticate(
		page: Page,
		{ url, waitUntilStable }: { url?: string | RegExp; waitUntilStable?: boolean } = {}
	): Promise< void > {
		const browserContext = page.context();
		await browserContext.clearCookies();

		if ( await this.hasFreshAuthCookies() ) {
			this.log( 'Found fresh cookies, skipping log in' );
			await browserContext.addCookies( await this.getAuthCookies() );
			await page.goto( getCalypsoURL( '/' ) );
		} else {
			this.log( 'Logging in via Login Page' );
			await this.logInViaLoginPage( page );
		}

		if ( url ) {
			await page.waitForURL( url, { timeout: 20 * 1000 } );
		}
		if ( waitUntilStable ) {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.waitForSidebarInitialization();
		}
	}

	/**
	 * Authenticates the account on WP-Admin page.
	 *
	 * @param {Page} page Page object.
	 */
	async authenticateWpAdmin( page: Page ) {
		const url = page.url();

		// Go to the wp-admin page to init the cookie
		const wpAdminDashboardPage = new WpAdminDashboardPage( page );
		await wpAdminDashboardPage.visit( this.getSiteURL( { protocol: false } ) );

		// Go back to the current page
		await page.goto( url );
	}

	/**
	 * Logs in via the login page UI. The verification code will be submitted
	 * automatically if it's defined in the secrets file.
	 *
	 * @param {Page} page on which actions are to take place.
	 */
	async logInViaLoginPage( page: Page ): Promise< void > {
		const loginPage = new LoginPage( page );

		await loginPage.visit();
		await loginPage.logInWithCredentials( this.credentials.username, this.credentials.password );

		// Handle possible 2FA.
		if ( this.credentials.totpKey ) {
			return await loginPage.submitVerificationCode( this.getTOTP() );
		}
		if ( this.credentials.smsNumber ) {
			return await loginPage.submitVerificationCode( await this.getSMSOTP() );
		}
	}

	/**
	 * Logs in via the login page UI, but shown on a popup.
	 *
	 * @param {Page} page Handle to the popup Page object.
	 */
	async logInViaPopupPage( page: Page ): Promise< void > {
		const loginPage = new LoginPage( page );

		const { username, password } = this.credentials;
		await loginPage.fillUsername( username );
		await loginPage.clickSubmit();
		await loginPage.fillPassword( password );

		// Popup pages close once authentication is successful.
		await Promise.all( [ page.waitForEvent( 'close' ), loginPage.clickSubmit() ] );
	}

	/**
	 * Retrieves the Time-based One-Time Password (a.k.a. verification code) from
	 * the secret file if defined for the current account.
	 *
	 * @returns {string} Generated TOTP value.
	 * @throws {Error} If TOTP secrets are missing for the user.
	 */
	getTOTP(): string {
		if ( ! this.credentials.totpKey ) {
			throw new Error(
				`Unable to generate TOTP verification code for user ${ this.credentials.username } due to missing TOTP key.`
			);
		}

		const totpClient = new TOTPClient( this.credentials.totpKey );
		return totpClient.getToken();
	}

	/**
	 * Retrives the SMS-based One-Time Password from Mailosaur.
	 *
	 * @returns {string} SMS 2FA value.
	 * @throws {Error} If EmailClient is unable to obtain the 2FA code.
	 */
	async getSMSOTP(): Promise< string > {
		if ( ! this.credentials.smsNumber ) {
			throw new Error( `User ${ this.credentials.username } has no SMS 2FA.` );
		}

		const emailClient = new EmailClient();
		const message = await emailClient.getLastMatchingMessage( {
			inboxId: SecretsManager.secrets.mailosaur.totpUserInboxId,
			sentTo: this.credentials.smsNumber.number,
			body: 'WordPress.com verification code',
		} );
		return emailClient.get2FACodeFromMessage( message );
	}

	/**
	 * Retrieves the site URL from the config file if defined for the current
	 * account.
	 *
	 * If `protocol` is set to false, only the site slug portion is returned.
	 *
	 * @param param0 Keyed object parameter.
	 * @param {boolean} [param0.protocol] Whether to include the protocol in
	 * the returned string. Defaults to true.
	 * @returns {string} Site Slug or fully-formed URL.
	 * @throws If the site URL is not available.
	 */
	getSiteURL( { protocol = true }: { protocol?: boolean } = {} ): string {
		return getAccountSiteURL( this.accountName, { protocol } );
	}

	/**
	 * Checks whether the current account has fresh auth cookies file available or
	 * not. Authentication cookies are considered to be fresh when they have less
	 * than 3 days.
	 */
	async hasFreshAuthCookies(): Promise< boolean > {
		try {
			const { birthtimeMs } = await fs.stat( this.getAuthCookiesPath() );
			const nowMs = Date.now();
			const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

			return nowMs < birthtimeMs + twoDaysMs;
		} catch {
			return false;
		}
	}

	/**
	 * Saves the authentication cookies to a JSON file inside the folder specified
	 * by the COOKIES_PATH env var. If that folder doesn't exist it will be
	 * created when this method is called.
	 */
	async saveAuthCookies( browserContext: BrowserContext ): Promise< void > {
		const cookiesPath = this.getAuthCookiesPath();

		// Force remove existing cookies to prevent complaints if they don't exist.
		// We need the remove step because otherwise, existing files will only be
		// modified and the "created" date will stay the same, failing the freshness
		// check.
		await fs.rm( cookiesPath, { force: true } );

		this.log( `Saving auth cookies to ${ cookiesPath }` );
		await browserContext.storageState( { path: cookiesPath } );
	}

	/**
	 * Retrieves previously saved authentication cookies for the current account.
	 */
	async getAuthCookies(): Promise< [ { name: string; value: string } ] > {
		const cookiesPath = this.getAuthCookiesPath();
		const storageStateFile = await fs.readFile( cookiesPath, { encoding: 'utf8' } );
		const { cookies } = JSON.parse( storageStateFile );

		return cookies;
	}

	/**
	 * Retrieves the path for the authentication cookies folder defined by the
	 * COOKIES_PATH env var.
	 *
	 * @throws If the COOKIES_PATH env var value is invalid.
	 */
	private getAuthCookiesPath(): string {
		return path.join( envVariables.COOKIES_PATH, `${ this.accountName }.json` );
	}

	/**
	 * Custom logger for the current account. Won't print unless the DEBUG env var
	 * is defined. Prefixes each message with the account name for easier
	 * reference. Formatted similarly to the pw:api logs.
	 */
	private log( message: string ) {
		const { DEBUG } = process.env;
		if ( DEBUG && DEBUG !== 'false' ) {
			console.log(
				`${ chalk.bold( chalk.magenta( `TestAccount:${ this.accountName }` ) ) } => ${ message }`
			);
		}
	}
}
