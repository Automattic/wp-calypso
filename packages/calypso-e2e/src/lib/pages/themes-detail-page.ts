/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';
import { PreviewComponent } from '../components';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	demoPane: '.theme__sheet-screenshot',
};

/**
 * Component representing the Apperance > Themes page.
 *
 * @augments {BaseContainer}
 */
export class ThemesDetailPage extends BaseContainer {
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		super( page );
	}

	/**
	 * Launches the live preview of the theme.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async preview(): Promise< void > {
		await this.page.click( selectors.demoPane );
		await PreviewComponent.Expect( this.page );
	}
}
