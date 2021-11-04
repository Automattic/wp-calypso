import { Page } from 'playwright';
import { NavbarComponent, MeSidebarComponent } from '../components';
import { AccountSettingsPage } from '../pages';
import type { LanguageSlug } from '@automattic/languages';

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
	async changeUILanguage( localeSlug: LanguageSlug ): Promise< void > {
		const navbarComponent = new NavbarComponent( this.page );
		await navbarComponent.clickMe();

		const meSidebar = new MeSidebarComponent( this.page );
		await meSidebar.navigate( '/me/account' );

		const accountSettingsPage = new AccountSettingsPage( this.page );
		await accountSettingsPage.changeUILanguage( localeSlug );

		// Wait for settings save and page reload.
		await this.page.waitForLoadState( 'networkidle' );
	}
}
