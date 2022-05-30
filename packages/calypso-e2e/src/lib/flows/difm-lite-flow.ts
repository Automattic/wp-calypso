import { Page } from 'playwright';

const selectors = {
	existingSite: ( listPosition: number ) => `.site-icon >> nth=${ listPosition }`,
};

/**
 * Class representing the difm-lite journey.
 */
export class DifmLiteFlow {
	private page: Page;

	/**
	 * Constructs an instance.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given a number, clicks the n'th item where nth is the number parametrer passed.
	 *
	 * @param {number} number N'th site on page.
	 */
	async selectASite( number = 0 ): Promise< void > {
		await this.page.click( selectors.existingSite( number ) );
	}
}
