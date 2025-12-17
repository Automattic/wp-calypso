/**
 * External dependencies
 */
import { Page } from 'playwright';
/**
 * Internal dependencies
 */
import envVariables from '../../env-variables';

/**
 * Dashboard page class for the new Multi-site Dashboard.
 *
 * This Page Object represents the new dashboard implementation
 * accessible under the /v2 path.
 */
export class DashboardPage {
	/**
	 * Reference to the Playwright page object.
	 */
	page: Page;

	/**
	 * Constructs a new DashboardPage instance.
	 *
	 * @param page - The Playwright page object.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Gets the dashboard base URL by converting calypso.localhost to my.localhost
	 * or wpcalypso.wordpress.com to my.wordpress.com.
	 *
	 * @returns The dashboard base URL.
	 */
	private getDashboardBaseURL(): string {
		const baseURL = envVariables.CALYPSO_BASE_URL;
		// Convert calypso.localhost:3000 to my.localhost:3000
		if ( baseURL.includes( 'calypso.localhost' ) ) {
			return baseURL.replace( 'calypso.localhost', 'my.localhost' );
		}
		// Convert wpcalypso.wordpress.com to my.wordpress.com
		if ( baseURL.includes( 'wpcalypso.wordpress.com' ) ) {
			return baseURL.replace( 'wpcalypso.wordpress.com', 'my.wordpress.com' );
		}
		// If already my.localhost or my.wordpress.com, use as-is
		return baseURL;
	}

	/**
	 * Constructs a dashboard URL with the given path.
	 *
	 * @param path - The path to append to the dashboard base URL.
	 * @returns The full dashboard URL.
	 */
	private getDashboardURL( path: string = '' ): string {
		const baseURL = this.getDashboardBaseURL();
		const cleanPath = path.startsWith( '/' ) ? path : `/${ path }`;
		return new URL( cleanPath, baseURL ).toString();
	}

	/**
	 * Visits the dashboard entry page.
	 *
	 * @returns Promise that resolves when navigation is complete.
	 */
	async visit(): Promise< void > {
		await this.page.goto( this.getDashboardURL() );
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
		const hasCorrectUrl =
			this.page.url().includes( 'my.localhost' ) || this.page.url().includes( 'my.wordpress.com' );

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
		await this.page.goto( this.getDashboardURL( subpath ) );
	}

	/**
	 * Checks if the current page is a 404 error page.
	 * Note: you should poll for the visibility of the 404 heading as it may not be immediately visible.
	 *
	 * @returns Promise that resolves to true if the page is a 404 error page.
	 * @example
	 * await expect.poll( async () => await pageDashboard.is404Page() ).toBe( true );
	 */
	async is404Page(): Promise< boolean > {
		return this.page.getByRole( 'heading', { name: 'Page not found' } ).isVisible();
	}
}
