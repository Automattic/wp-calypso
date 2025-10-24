import { Locator, Page } from 'playwright';

/**
 * Represents the WordPress.com Logged Out Home Page (LOHP).
 */
export class LoggedOutHomePage {
	private page: Page;
	readonly logInMenuItem: Locator;
	readonly exploreThemesLink: Locator;

	/**
	 * Constructs an instance of the LOHP.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.logInMenuItem = this.page.getByRole( 'menuitem', { name: 'Log In' } );
		this.exploreThemesLink = this.page.getByRole( 'link', { name: 'Explore themes' } );
	}
}
