import { Page } from 'playwright';

const selectors = {
	inputPrompt: 'span.p2020-editor-placeholder__prompt',
};

/**
 *
 */
export class P2Page {
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
	 *
	 */
	async focusInlineEditor(): Promise< void > {
		await this.page.click( selectors.inputPrompt );
	}
}
