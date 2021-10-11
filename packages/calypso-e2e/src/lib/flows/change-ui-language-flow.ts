import { Page } from 'playwright';
import { NavbarComponent } from '../components';
import { AccountSettingsPage } from '../pages';

/**
 * Change the UI language.
 */
export class ChangeUILanguageFlow {
	private page: Page;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Changes the UI langauge.
	 *
	 * This method will navigate from the navbar to the /me page,
	 * then onto Account Settings.
	 */
	async changeUILanguage( localeSlug: string ): Promise< void > {
		const navbarComponent = new NavbarComponent( this.page );
		await navbarComponent.clickMe();

		// @todo: MeSidebarComponent.navigate() doesn't work on non-English UI.
		await this.page.click( 'a[href="/me/account"]' );

		const accountSettingsPage = new AccountSettingsPage( this.page );
		await accountSettingsPage.changeUILanguage( localeSlug );
	}
}
