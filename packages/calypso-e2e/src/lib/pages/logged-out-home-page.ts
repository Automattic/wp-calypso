import { Locator, Page } from 'playwright';
import { BrowserManager, envVariables } from '../..';

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
		this.exploreThemesLink = this.page.getByRole( 'link', { name: 'Explore themes' } );
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
	 * Sets the store cookie for the specified currency.
	 * @param currency
	 */
	async setStoreCookie( currency: string ): Promise< void > {
		await BrowserManager.setStoreCookie( this.page, { currency } );
	}
}
