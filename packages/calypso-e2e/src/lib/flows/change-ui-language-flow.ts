import { Page } from 'playwright';
import { NavbarComponent, SidebarComponent } from '../components';
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
		await new SidebarComponent( this.page ).waitForSidebarInitialization();

		const navbarComponent = new NavbarComponent( this.page );
		await navbarComponent.clickMe();

		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( 'a[href="/me/account"]' ),
		] );

		const accountSettingsPage = new AccountSettingsPage( this.page );
		await accountSettingsPage.changeUILanguage( localeSlug );
	}
}
