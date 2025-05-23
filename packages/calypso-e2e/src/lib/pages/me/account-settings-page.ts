import { Page } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';
import { reloadAndRetry } from '../../../element-helper';
import type { LanguageSlug } from '@automattic/languages';

const selectors = {
	// Close account
	closeAccountLink: 'p:text("Delete your account permanently")',
	closeAccountButton: 'button:text("Delete account")',
	deletedItemsSidebar: 'text=These items will be deleted',

	// Modal
	modalContinueButton: 'button:text("Continue")',
	usernameSpan: 'span.account-close__confirm-dialog-target-username',
	usernameConfirmationInput: 'input[id="confirmAccountCloseInput"]',
	// The delete button is outside the confirm dialog but has the is-scary class
	modalCloseAccountButton: 'button.is-scary',

	// UI Language
	uiLanguageButton: 'button.language-picker',
	uiLanguageSearch: '.language-picker-component__search-desktop .search-component__input',
	uiLanguageItem: ( localeSlug: LanguageSlug ) =>
		`.language-picker-component__language-button:has([lang="${ localeSlug }"])`,
	uiLanguageApplyButton: '.language-picker__modal-buttons button.is-secondary',
};

/**
 * Represents the Me > Account Settings page.
 */
export class AccountSettingsPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Visit the `/me/account` endpoint directly.
	 */
	async visit(): Promise< void > {
		await this.page.goto( getCalypsoURL( 'me/account' ) );
	}

	/**
	 * Closes the currently logged in user's account.
	 */
	async closeAccount(): Promise< void > {
		/**
		 * Closure to handle the scenario where purchase(s) have been cancelled on the frontend,
		 * but the backend still thinks there are valid purchases.
		 * This is typically observed for more 'involved' purchases such as domains.
		 *
		 * @param {Page} page Page object.
		 */
		async function waitForPurchasesRemoved( page: Page ): Promise< void > {
			await page.waitForSelector( selectors.closeAccountButton );
		}

		// Wait for the async navigation after clicking on the initial `Close Account` link at /me/account.
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.closeAccountLink ),
		] );

		// This page is tricky. All the text and the close account button load in and are "visible",
		// except they are then covered over with gray boxes. The button is still "clickable", but doesn't do anything.
		// The only thing that doesn't appear until all the loading is done is the sidebar of items to be deleted.
		// So we must wait for that text before continuing, or our close account button click can get swallowed!
		await this.page.waitForSelector( selectors.deletedItemsSidebar );

		// Ensure the button is not `Manage Purchases` but rather `Close Account` a few times.
		await reloadAndRetry( this.page, waitForPurchasesRemoved );

		// `Close Account` button on /me/account/close.
		await this.page.click( selectors.closeAccountButton );

		// `Are you sure?` modal.
		await this.page.click( selectors.modalContinueButton );

		// Get username and fill the input
		const username = await this.page
			.waitForSelector( selectors.usernameSpan )
			.then( ( element ) => element.innerText() );

		// Fill the input and ensure it's focused
		await this.page.focus( selectors.usernameConfirmationInput );
		await this.page.fill( selectors.usernameConfirmationInput, username );

		// Press Tab twice to reach the button and then press Enter
		await this.page.keyboard.press( 'Tab' );
		await this.page.keyboard.press( 'Tab' );
		await this.page.keyboard.press( 'Enter' );
	}

	/**
	 * Changes the UI language for the currently logged in user.
	 */
	async changeUILanguage( localeSlug: LanguageSlug ): Promise< void > {
		await this.page.click( selectors.uiLanguageButton );
		await this.page.fill( selectors.uiLanguageSearch, localeSlug );
		await this.page.click( selectors.uiLanguageItem( localeSlug ) );
		await this.page.click( selectors.uiLanguageApplyButton );
		await this.page.waitForLoadState();
	}
}
