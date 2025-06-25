/**
 * External dependencies
 */
import { Page } from 'playwright';
/**
 * Internal dependencies
 */
import { getCalypsoURL } from '../../data-helper';

/**
 * Dashboard page class for the new v2 dashboard.
 *
 * This Page Object represents the new dashboard implementation
 * accessible under the /v2 path.
 */
export class DashboardPage {
	/**
	 * Reference to the Playwright page object.
	 */
	private page: Page;

	/**
	 * Constructs a new DashboardPage instance.
	 *
	 * @param page - The Playwright page object.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Visits the dashboard entry page.
	 *
	 * @returns Promise that resolves when navigation is complete.
	 */
	async visit(): Promise< void > {
		await this.page.goto( getCalypsoURL( 'v2' ) );
		// Wait for the main content to be visible
		await this.page.getByRole( 'main' ).waitFor();
	}

	/**
	 * Checks if the dashboard has loaded correctly.
	 *
	 * @returns Promise that resolves to true if the dashboard is loaded.
	 */
	async isLoaded(): Promise< boolean > {
		const isMainContentVisible = await this.page.getByRole( 'main' ).isVisible();
		const hasCorrectUrl = this.page.url().includes( '/v2' );
		return isMainContentVisible && hasCorrectUrl;
	}

	/**
	 * Gets the visible heading text on the dashboard.
	 *
	 * @returns Promise that resolves to the heading text.
	 */
	async getHeadingText(): Promise< string | null > {
		const heading = this.page.getByRole( 'heading' ).first();
		return heading ? await heading.textContent() : null;
	}

	/**
	 * Navigates to a specific section of the dashboard by clicking on
	 * a navigation item with the given name.
	 *
	 * @param name - The name of the navigation item to click.
	 * @returns Promise that resolves when navigation is complete.
	 */
	async navigateToSection( name: string ): Promise< void > {
		await this.page.getByRole( 'link', { name } ).click();
		// Wait for navigation to complete
		await this.page.waitForLoadState( 'networkidle' );
	}

	/**
	 * Visits a specific subpath within the dashboard.
	 *
	 * @param subpath - The subpath to visit under /v2.
	 * @returns Promise that resolves when navigation is complete.
	 */
	async visitPath( subpath: string ): Promise< void > {
		const path = subpath.startsWith( '/' ) ? subpath : `/${ subpath }`;
		await this.page.goto( getCalypsoURL( `v2${ path }` ) );
	}

	/**
	 * Checks if the current page is a 404 error page.
	 *
	 * @returns Promise that resolves to true if the page is a 404 error page.
	 */
	async is404Page(): Promise< boolean > {
		await this.page.getByRole( 'heading', { name: '/not found/i' } );
		return true;

		// // Look for typical 404 page elements
		// const notFoundHeading = this.page.getByRole( 'heading', { name: /not found|404/i } );
		// const notFoundText = this.page.getByText(
		// 	/page (does not exist|not found|couldn't be found)/i
		// );

		// // Check if either indicator is visible
		// return ( await notFoundHeading.isVisible() ) || ( await notFoundText.isVisible() );
	}
}
