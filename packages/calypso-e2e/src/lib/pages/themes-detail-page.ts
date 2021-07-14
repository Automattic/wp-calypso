/**
 * Internal dependencies
 */
import { Page } from 'playwright';
import { BaseContainer } from '../base-container';
import { PreviewComponent } from '../components';

const selectors = {
	demoPane: '.theme__sheet-screenshot',
	activateDesignButton: 'button:text("Activate this design")',
	customizeDesignButton: 'span:text("Customize site")',

	// Activate modal
	activateModal: '.themes__auto-loading-homepage-modal',
	activateModalButton: '.dialog__action-buttons button:has-text("Activate")',

	// Thanks modal
	thanksMessage: ':text("Thanks for choosing")',
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

	/**
	 * Activates the theme.
	 *
	 * If the optional parameter `keepModal` is set to true, the Thanks message modal will not
	 * be dismissed.
	 *
	 * @param {boolean} [keepModal] Optional parameter that if set to true will keep the thanks modal open. Defaults to false.
	 * @returns {Promise<void>} No return value.
	 */
	async activate( { keepModal = false }: { keepModal?: boolean } = {} ): Promise< void > {
		await this.page.click( selectors.activateDesignButton );
		await this.page.waitForSelector( selectors.activateModal );
		await this.page.click( selectors.activateModalButton );
		await this.page.waitForSelector( selectors.thanksMessage );
		if ( ! keepModal ) {
			await this.page.keyboard.press( 'Escape' );
		}
	}

	/**
	 * Clicks on the Customize site button once the theme has been applied
	 * from the details page.
	 *
	 * This method will expect and return a new page that will be launched in the current
	 * browser context.
	 *
	 * @returns {Promise<Page} New tab/popup page.
	 */
	async customizeSite(): Promise< Page > {
		const [ popup ] = await Promise.all( [
			this.page.waitForEvent( 'popup' ),
			this.page.click( selectors.customizeDesignButton ),
		] );
		return popup;
	}
}
