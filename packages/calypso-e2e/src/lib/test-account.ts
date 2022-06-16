import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { BrowserContext, Page } from 'playwright';
import { TestAccountName } from '..';
import { getAccountCredential, getAccountSiteURL, getCalypsoURL } from '../data-helper';
import envVariables from '../env-variables';
import { TOTPClient } from '../totp-client';
import { LoginPage } from './pages/login-page';
import type { AccountCredentials } from '../types/data-helper.types';

/**
 * Represents the WPCOM test account.
 */
export class TestAccount {
	readonly accountName: TestAccountName;
	readonly credentials: AccountCredentials;

	/**
	 * Constructs an instance of the TestAccount for the given account name.
	 * Available test accounts should be defined in the e2e secrets file.
	 */
	constructor( accountName: TestAccountName ) {
		this.accountName = accountName;
		this.credentials = getAccountCredential( accountName );
	}

	/**
	 * Authenticates the account using previously saved cookies or via the login
	 * page UI if cookies are unavailable.
	 */
	async authenticate( page: Page ): Promise< void > {
		const browserContext = await page.context();
		await browserContext.clearCookies();

		if ( await this.hasFreshAuthCookies() ) {
			this.log( 'Found fresh cookies, skipping log in' );
			await browserContext.addCookies( await this.getAuthCookies() );
			await page.goto( getCalypsoURL( '/' ) );
		} else {
			this.log( 'Logging in via Login Page' );
			await this.logInViaLoginPage( page );
		}
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

		const verificationCode = this.getTOTP();
		if ( verificationCode ) {
			await loginPage.submitVerificationCode( verificationCode );
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
	 */
	getTOTP(): string | undefined {
		if ( ! this.credentials.totpKey ) {
			return undefined;
		}

		const totpClient = new TOTPClient( this.credentials.totpKey );
		return totpClient.getToken();
	}

	/**
	 * Retrieves the site URL from the config file if defined for the current
	 * account.
	 *
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
	private log( message: any ) {
		const { DEBUG } = process.env;
		if ( DEBUG && DEBUG !== 'false' ) {
			console.log(
				`${ chalk.bold( chalk.magenta( `TestAccount:${ this.accountName }` ) ) } => ${ message }`
			);
		}
	}
}
