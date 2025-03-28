import { Page, Locator } from 'playwright';

type Sections =
	| 'Composing'
	| 'Media'
	| 'Content types'
	| 'Feed settings'
	| 'Theme enhancements'
	| 'Widgets'
	| 'Publishing Tools'
	| 'WordPress.com toolbar';
type ToggleLevel = 'parent' | 'child';

const selectors = {
	// Section
	sectionHeader: ( name: Sections ) => `.section-header :text("${ name }")`,

	// Toggles
	parentToggle: ( text: string ) => `span:has(:text("${ text }")) .components-form-toggle`,
	childToggle: ( text: string ) =>
		`div.site-settings__child-settings:has(label:text("${ text }")) .components-form-toggle`,

	// Media section
	carouselBackgroundColorSelect: 'select[id="carousel_background_color"]',
};

/**
 * Represents the Settings > General Settings page.
 */
export class WritingSettingsPage {
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
	 * Validate the presence of a section.
	 */
	async validateSection( name: Sections ): Promise< void > {
		const locator = this.page.locator( selectors.sectionHeader( name ) );
		await locator.waitFor();
	}

	/* Media (Carousel) */

	/**
	 * Toggle the input to on.
	 *
	 * @param {ToggleLevel} level Whether the toggle is a parent or child level.
	 * @param {string} text Exact text on the toggle.
	 */
	async toggleOn( level: 'parent' | 'child', text: string ): Promise< void > {
		let locator: Locator;
		if ( level === 'parent' ) {
			locator = this.page.locator( selectors.parentToggle( text ) );
		} else {
			locator = this.page.locator( selectors.childToggle( text ) );
		}

		if ( await this.isToggled( locator ) ) {
			return;
		}

		await locator.click();
	}

	/**
	 * Toggle the input to off.
	 *
	 * @param {ToggleLevel} level Whether the toggle is a parent or child level.
	 * @param {string} text Exact text on the toggle.
	 */
	async toggleOff( level: ToggleLevel, text: string ): Promise< void > {
		let locator: Locator;
		if ( level === 'parent' ) {
			locator = this.page.locator( selectors.parentToggle( text ) );
		} else {
			locator = this.page.locator( selectors.childToggle( text ) );
		}

		if ( ! ( await this.isToggled( locator ) ) ) {
			return;
		}

		await locator.click();
	}

	/**
	 * Returns whether the toggle at `locator` is toggled
	 * in the On state.
	 *
	 * @returns {Promise<boolean>} True if toggle is on. False otherwise.
	 */
	private async isToggled( locator: Locator ): Promise< boolean > {
		await locator.waitFor();

		const classes = await locator.getAttribute( 'class' );
		return !! classes?.includes( 'is-checked' );
	}

	/**
	 * Selects the carousel background color.
	 *
	 * @param {'Black'|'White'} color Color to select.
	 */
	async selectCarouselBackgroundColor( color: 'Black' | 'White' ): Promise< void > {
		const locator = this.page.locator( selectors.carouselBackgroundColorSelect );
		await locator.selectOption( color.toLowerCase() );
	}
}
