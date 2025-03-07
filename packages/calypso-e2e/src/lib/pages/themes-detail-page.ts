import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { PreviewComponent } from '../components';

const selectors = {
	// Preview
	demoButton: 'button:text("Demo site")',

	// Main body
	activateDesignButton: 'button:text("Activate this design")',
	customizeDesignButton: 'span:text("Customize site")',

	// Activate modal
	activateModal: '.themes__activation-modal',
	activateModalButton: '.dialog__action-buttons button:has-text("Activate")',

	// Thanks modal
	thanksMessage: ':text("Thanks for choosing")',
};

/**
 * Component representing the Apperance > Themes page.
 */
export class ThemesDetailPage {
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
	 * Launches the live preview of the theme.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async preview(): Promise< void > {
		await this.page.click( selectors.demoButton );
		const previewComponent = new PreviewComponent( this.page );
		await previewComponent.previewReady();
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
		await this.page.click( selectors.activateModalButton );
		await this.page.waitForSelector( selectors.thanksMessage );
		if ( ! keepModal ) {
			await this.page.keyboard.press( 'Escape' );
		}
	}

	/**
	 * Click on the Activate button displayed in Logged out theme details.
	 */
	async pickThisDesign(): Promise< void > {
		await this.page.getByRole( 'link', { name: 'Get started' } ).click();
	}

	/**
	 * Visit the theme details page.
	 *
	 * @param themeSlug
	 * @param siteSlug
	 */
	async visitTheme( themeSlug: string, siteSlug: string | null = null ) {
		const targetUrl = `theme/${ themeSlug }/${ siteSlug ?? '' }`;

		// We are getting a pending status for https://wordpress.com/cspreport intermittently
		// which causes the login to hang on networkidle when running the tests locally.
		// This fulfill's the route request with status 200.
		// See https://github.com/Automattic/wp-calypso/issues/69294
		await this.page.route( '**/cspreport', ( route ) => {
			route.fulfill( {
				status: 200,
			} );
		} );
		return await this.page.goto( getCalypsoURL( targetUrl ) );
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
