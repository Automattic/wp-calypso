/* eslint-disable require-jsdoc */
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { chromium, BrowserContext, Page } from 'playwright';
import { getLaunchConfiguration } from '../browser-helper';
import { getAccountCredential, getAccountSiteURL, getCalypsoURL } from '../data-helper';
import { LoginPage } from './pages/login-page';

export class TestAccount {
	readonly accountName: string;
	readonly credentials: [ string, string ];
	readonly siteURL: string;

	constructor( accountName: string ) {
		this.accountName = accountName;
		this.credentials = getAccountCredential( accountName );
		this.siteURL = getAccountSiteURL( accountName );
	}

	async logInAndSaveAuthCookies(): Promise< void > {
		const cookiesPath = process.env.COOKIES_PATH as string;
		if ( ! cookiesPath ) {
			throw new Error( 'Invalid COOKIES_PATH value' );
		}
		const storageStateFilePath = path.join( cookiesPath, `${ this.accountName }.json` );
		let isCookieFresh;

		try {
			const { birthtimeMs } = await fs.stat( storageStateFilePath );
			isCookieFresh = birthtimeMs > Date.now() - 3 * 24 * 60 * 60 * 1000; // less than 3 days
		} catch {
			isCookieFresh = false;
		}

		if ( ! isCookieFresh ) {
			this.log( 'Logging in' );

			const browser = await chromium.launch();
			const { userAgent } = getLaunchConfiguration( browser.version() );
			const browserContext = await browser.newContext( { userAgent } );
			const page = await browserContext.newPage();
			const loginPage = new LoginPage( page );

			await loginPage.visit();
			await loginPage.logInWithCredentials( ...this.credentials );

			this.log( 'Saving auth cookies' );

			await browserContext.storageState( { path: storageStateFilePath } );
			await browser.close();
		} else {
			this.log( 'Found fresh auth cookies' );
		}
	}

	async loadAuthCookies( browserContext: BrowserContext, testAccount: string ): Promise< boolean > {
		const { COOKIES_PATH } = process.env;
		if ( ! COOKIES_PATH ) {
			return false;
		}

		const storageStateFilePath = path.join( COOKIES_PATH, `${ testAccount }.json` );
		let isCookieFresh;

		try {
			const { birthtimeMs } = await fs.stat( storageStateFilePath );
			isCookieFresh = birthtimeMs > Date.now() - 3 * 24 * 60 * 60 * 1000; // less than 3 days
		} catch {
			isCookieFresh = false;
		}

		if ( ! isCookieFresh ) {
			return false;
		}

		this.log( 'Loading auth cookies' );

		const storageStateFile = await fs.readFile( storageStateFilePath, { encoding: 'utf8' } );
		const { cookies } = JSON.parse( storageStateFile );

		await browserContext.clearCookies();
		await browserContext.addCookies( cookies );

		return true;
	}

	async authenticate( page: Page ): Promise< void > {
		const cookiesLoaded = await this.loadAuthCookies( await page.context(), this.accountName );
		if ( cookiesLoaded ) {
			await page.goto( getCalypsoURL( '/' ) );
		} else {
			const loginPage = new LoginPage( page );

			this.log( 'Logging in' );
			await loginPage.visit();
			await loginPage.logInWithCredentials( ...this.credentials );
		}
	}

	log( message: string ) {
		if ( ! process.env.DEBUG ) return;
		console.log(
			`${ chalk.bold( chalk.magenta( `TestAccount:${ this.accountName }` ) ) } => ${ message }`
		);
	}
}
