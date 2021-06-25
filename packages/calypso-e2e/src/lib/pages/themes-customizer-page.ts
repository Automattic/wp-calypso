/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page, Frame } from 'playwright';

const selectors = {
	frame: 'iframe[title="Customizer"]',
};

/**
 * Component representing the Appearance > Customize page.
 *
 * @augments {BaseContainer}
 */
export class ThemesCustomizerPage extends BaseContainer {
	frame!: Frame;
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		super( page );
	}

	async _postInit(): Promise< void > {
		const elementHandle = await this.page.waitForSelector( selectors.frame );
		this.frame = ( await elementHandle.contentFrame() ) as Frame;
	}

	async close(): Promise< void > {
		await this.page.close();
	}
}
