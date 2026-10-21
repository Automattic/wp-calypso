import { BrowserManager, envVariables } from '../..';
import { waitForLocatorAttribute } from '../../element-helper';
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
		const themesHref = await waitForLocatorAttribute(
			this.exploreThemesLink,
			'href',
			/\/themes\/?(?:[?#].*)?$/,
			{
				timeout: 10_000,
				description: 'Explore themes link',
				state: 'visible',
			}
		);

		const response = await this.page.goto( new URL( themesHref, this.page.url() ).href, {
			// CI traces in wp-calypso#111117 showed this route can spend over 50s server-side
			// before the document loads.
			timeout: 60_000,
			waitUntil: 'domcontentloaded',
		} );

		if ( ! response?.ok() ) {
			throw new Error(
				`Themes page failed to load: ${ response?.status() ?? 'no response' } ${
					response?.url() ?? themesHref
				}`
			);
		}
	}

	/**
	 * Sets the store cookie for the specified currency.
	 * @param currency
	 */
	async setStoreCookie( currency: string ): Promise< void > {
		await BrowserManager.setStoreCookie( this.page, { currency } );
	}
}
