import { expect } from 'playwright/test';
import { BrowserManager, envVariables } from '../..';
import type { Locator, Page } from 'playwright';

/**
 * Represents the WordPress.com Logged Out Home Page (LOHP).
 */
export class LoggedOutHomePage {
	private page: Page;
	readonly logInMenuItem: Locator;
	readonly exploreThemesLink: Locator;
	readonly heading: Locator;

	/**
	 * Constructs an instance of the LOHP.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.logInMenuItem = this.page.getByRole( 'menuitem', { name: 'Log In' } );
		this.exploreThemesLink = this.page.getByRole( 'link', {
			name: 'Explore themes',
			exact: true,
		} );
		this.heading = this.page.getByRole( 'heading', { name: 'WordPress' } ).first();
	}

	/**
	 * Navigates to the logged out home page.
	 * returns {Promise<void>}
	 */
	async visit(): Promise< void > {
		await this.page.goto( envVariables.WPCOM_BASE_URL );
	}

	/**
	 * Navigates to the logged-out themes showcase page.
	 * returns {Promise<void>}
	 */
	async exploreThemes(): Promise< void > {
		await expect( this.exploreThemesLink ).toBeVisible( { timeout: 10_000 } );
		await expect( this.exploreThemesLink ).toHaveAttribute( 'href', /\/themes\/?(?:[?#].*)?$/, {
			timeout: 10_000,
		} );

		const themesHref = await this.exploreThemesLink.getAttribute( 'href' );
		if ( ! themesHref ) {
			throw new Error( 'Explore themes URL not found' );
		}

		await this.page.goto( new URL( themesHref, this.page.url() ).href, {
			timeout: 30_000,
			waitUntil: 'domcontentloaded',
		} );
	}

	/**
	 * Sets the store cookie for the specified currency.
	 * @param currency
	 */
	async setStoreCookie( currency: string ): Promise< void > {
		await BrowserManager.setStoreCookie( this.page, { currency } );
	}
}
