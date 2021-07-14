import { BaseContainer } from '../base-container';
import { PreviewComponent } from '../components';

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
	 * Launches the live preview of the theme.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async preview(): Promise< void > {
		await this.page.click( selectors.demoPane );
		await PreviewComponent.Expect( this.page );
	}
}
