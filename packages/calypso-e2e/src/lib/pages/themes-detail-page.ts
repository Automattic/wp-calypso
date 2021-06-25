/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';
import { PreviewComponent } from '../components';

const selectors = {
	demoPane: '.theme__sheet-screenshot',
	activateDesignButton: 'button >> text="Activate this design"',

	// Activate modal
	activateModal: '.themes__auto-loading-homepage-modal',
	activateModalButton: '.dialog__action-buttons button:has-text("Activate")',
};

/**
 * Component representing the Apperance > Themes page.
 *
 * @augments {BaseContainer}
 */
export class ThemesDetailPage extends BaseContainer {
	/**
	 * Launches the live preview of the theme.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async preview(): Promise< void > {
		await this.page.click( selectors.demoPane );
		await PreviewComponent.Expect( this.page );
	}

	async activate(): Promise< void > {
		await this.page.pause();
		await this.page.click( selectors.activateDesignButton );
		await this.page.waitForSelector( selectors.activateModal );
		await this.page.click( selectors.activateModalButton );
	}
}
