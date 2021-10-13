import { Page } from 'playwright';
import { NavbarComponent, MeSidebarComponent } from '../components';
import { AccountSettingsPage, AccountClosedPage } from '../pages';

/**
 * Closes the ccount.
 */
export class CloseAccountFlow {
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
	 * Closes the account.
	 *
	 * This method will navigate from the navbar to the /me page,
	 * then onto Account Settings.
	 */
	async closeAccount(): Promise< void > {
		const navbarComponent = new NavbarComponent( this.page );
		await navbarComponent.clickMe();
		const meSidebarComponent = new MeSidebarComponent( this.page );
		await meSidebarComponent.navigate( 'Account Settings' );

		const accountSettingsPage = new AccountSettingsPage( this.page );
		await accountSettingsPage.closeAccount();

		const accountClosedPage = new AccountClosedPage( this.page );
		await accountClosedPage.confirmAccountClosed();
	}
}
