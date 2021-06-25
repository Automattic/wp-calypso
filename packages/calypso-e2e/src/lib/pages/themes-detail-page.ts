/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';
import { PreviewComponent } from '../components';
import { ThemesCustomizerPage } from './';

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

	async activate(): Promise< void > {
		await this.page.click( selectors.activateDesignButton );
		await this.page.waitForSelector( selectors.activateModal );
		await this.page.click( selectors.activateModalButton );
		await this.page.waitForSelector( selectors.thanksMessage );
		await this.page.keyboard.press( 'Escape' );
	}

	async customizeSite(): Promise< void > {
		const [ popup ] = await Promise.all( [
			this.page.waitForEvent( 'popup' ),
			this.page.click( selectors.customizeDesignButton ),
		] );
		const themesCusomizerPage = await ThemesCustomizerPage.Expect( popup );
		await themesCusomizerPage.close();
	}
}
