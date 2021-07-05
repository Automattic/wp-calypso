/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Frame } from 'playwright';

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
	 * Post-initialization steps.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		const elementHandle = await this.page.waitForSelector( selectors.frame );
		this.frame = ( await elementHandle.contentFrame() ) as Frame;
	}

	/**
	 * Closes the Appearance > Customize page when launched in a new tab.
	 *
	 * This behavior occurs when the customization option is clicked on from the
	 * themes page after the particular theme has been applied.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closeTab(): Promise< void > {
		await this.page.close();
	}
}
