import { Page } from 'playwright';

const selectors = {
	actionButton: ( text: string ) => `button:has-text("${ text }")`,
};

/**
 *
 */
export class ReactModalComponent< PageObject > {
	private page: Page;
	readonly pageObject: PageObject;

	/**
	 * Constructs an instance of this component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {any} pageObject Dependency injected page object.
	 */
	constructor( page: Page, pageObject: PageObject ) {
		this.page = page;
		this.pageObject = pageObject;
	}

	/**
	 * Clicks on the button on the modal.
	 *
	 * @param {string} text Text to match on the button.
	 */
	async clickButton( text: string ): Promise< void > {
		const locator = this.page.locator( selectors.actionButton( text ) );
		await locator.click();
	}
}
