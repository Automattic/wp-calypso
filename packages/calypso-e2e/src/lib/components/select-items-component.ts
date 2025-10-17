import { Page } from 'playwright';

/**
 * Component representing the Select Items component.
 */
export class SelectItemsComponent {
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
	 * Clicks on a button matching the text.
	 *
	 * @param {string} title Title of the item.
	 * @param {string} actionText Action text of the item.
	 */
	async clickButton( title: string, actionText: string ): Promise< void > {
		await this.page
			.getByRole( 'button', { name: `${ title }. ${ actionText }`, exact: true } )
			.click();
	}
}
