/* eslint-disable require-jsdoc */
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { BrowserContext, Page } from 'playwright';
import { getAccountCredential, getAccountSiteURL, getCalypsoURL } from '../data-helper';
import { LoginPage } from './pages/login-page';

export class TestAccount {
	readonly accountName: string;
	readonly credentials: [ string, string ];
	readonly siteURL: string;

	constructor( accountName: string ) {
		this.accountName = accountName;
		this.credentials = getAccountCredential( accountName );
		try {
			this.siteURL = getAccountSiteURL( accountName );
		} catch {
			this.siteURL = '';
		}
	}

	async authenticate( page: Page ): Promise< void > {
		const browserContext = await page.context();
		await browserContext.clearCookies();

		if ( await this.hasFreshCookies() ) {
			this.log( 'Found fresh cookies, skipping log in' );
			await browserContext.addCookies( await this.getCookies() );
			await page.goto( getCalypsoURL( '/' ) );
		} else {
			this.log( 'Logging in via Login Page' );
			await this.logInViaLoginPage( page );
		}
	}

	async logInViaLoginPage( page: Page ): Promise< void > {
		const loginPage = new LoginPage( page );

		await loginPage.visit();
		await loginPage.logInWithCredentials( ...this.credentials );
	}

	async hasFreshCookies(): Promise< boolean > {
		try {
			const { birthtimeMs } = await fs.stat( this.getCookiesPath() );
			const nowMs = Date.now();
			const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

			return nowMs < birthtimeMs + threeDaysMs;
		} catch {
			return false;
		}
	}

	async saveCookies( browserContext: BrowserContext ): Promise< void > {
		const cookiesPath = this.getCookiesPath();

		this.log( `Saving auth cookies to ${ cookiesPath }` );
		await browserContext.storageState( { path: cookiesPath } );
	}

	async getCookies(): Promise< [ { name: string; value: string } ] > {
		const cookiesPath = this.getCookiesPath();
		const storageStateFile = await fs.readFile( cookiesPath, { encoding: 'utf8' } );
		const { cookies } = JSON.parse( storageStateFile );

		return cookies;
	}

	private getCookiesPath(): string {
		const { COOKIES_PATH } = process.env;
		if ( COOKIES_PATH === undefined ) {
			throw new Error( 'Undefined COOKIES_PATH env variable' );
		}

		if ( COOKIES_PATH === '' ) {
			throw new Error( 'COOKIES_PATH env variable should not be an empty string' );
		}

		return path.join( COOKIES_PATH, `${ this.accountName }.json` );
	}

	private log( message: string ) {
		if ( ! process.env.DEBUG ) return;
		console.log(
			`${ chalk.bold( chalk.magenta( `TestAccount:${ this.accountName }` ) ) } => ${ message }`
		);
	}
}
