/**
 * External dependencies
 */
import { Page } from 'playwright';

/**
 * Dashboard Performance page class for the site performance section.
 *
 * This Page Object represents the site performance page
 * accessible under the /sites/{siteSlug}/performance path.
 */
export class DashboardPerformancePage {
	/**
	 * Reference to the Playwright page object.
	 */
	page: Page;

	/**
	 * Constructs a new DashboardPerformancePage instance.
	 *
	 * @param page - The Playwright page object.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Checks if the performance page shows the hosting feature gate.
	 * This appears when the site doesn't have the performance feature.
	 *
	 * @returns Promise that resolves to true if the feature gate is visible.
	 */
	async isFeatureGateVisible(): Promise< boolean > {
		// Lookthis.page.getByText( 'Performance monitoring'e's an SVG icon
		return this.page.getByRole( 'button', { name: /upgrade plan/i } ).isVisible();
	}

	/**
	 * Gets the device toggle (Mobile/Desktop) element.
	 *
	 * @returns Promise that resolves to the device toggle element.
	 */
	async getDeviceToggle(): Promise< any > {
		return this.page.getByRole( 'button', { name: /mobile|desktop/i } );
	}

	/**
	 * Switches the device toggle to the specified device.
	 *
	 * @param device - The device to switch to ('mobile' or 'desktop').
	 * @returns Promise that resolves when the toggle is clicked.
	 */
	async switchDevice( device: 'mobile' | 'desktop' ): Promise< void > {
		await this.page.getByRole( 'button', { name: device, exact: true } ).click();
	}

	/**
	 * Gets the page selector dropdown element.
	 *
	 * @returns Promise that resolves to the page selector element.
	 */
	async getPageSelector(): Promise< any > {
		return this.page.getByRole( 'combobox' );
	}

	/**
	 * Selects a specific page from the page selector.
	 *
	 * @param pageName - The name of the page to select.
	 * @returns Promise that resolves when the page is selected.
	 */
	async selectPage( pageName: string ): Promise< void > {
		await this.page.getByRole( 'combobox' ).click();
		await this.page.getByRole( 'option', { name: pageName } ).click();
	}

	/**
	 * Gets the "Run new test" or "Retest" button.
	 *
	 * @returns Promise that resolves to the retest button element.
	 */
	async getRetestButton(): Promise< any > {
		return this.page.getByRole( 'button', { name: /run new test|retest/i } );
	}

	/**
	 * Clicks the retest button to run a new performance test.
	 *
	 * @returns Promise that resolves when the button is clicked.
	 */
	async clickRetest(): Promise< void > {
		await this.page.getByRole( 'button', { name: /run new test|retest/i } ).click();
	}

	/**
	 * Checks if the performance report is loading.
	 *
	 * @returns Promise that resolves to true if the loading state is visible.
	 */
	async isReportLoading(): Promise< boolean > {
		return this.page.getByText( /checking for an existing report/i ).isVisible();
	}

	/**
	 * Waits for the loading to finish.
	 *
	 * @param timeout - Maximum time to wait in milliseconds (default: 30000).
	 * @returns Promise that resolves when loading is complete or times out.
	 */
	async waitForLoadingToFinish( timeout: number = 30000 ): Promise< void > {
		await this.page.getByText( /checking for an existing report/i ).waitFor( {
			state: 'hidden',
			timeout,
		} );
	}

	/**
	 * Checks if the performance report has loaded and is visible.
	 *
	 * @returns Promise that resolves to true if the report is visible.
	 */
	async isReportVisible(): Promise< boolean > {
		return await this.page
			.getByText(
				/first contentful paint|page load timeline|personalized recommendations|performance score/i
			)
			.first()
			.isVisible();
	}

	/**
	 * Checks if there's an error message visible on the performance page.
	 *
	 * @returns Promise that resolves to true if an error is visible.
	 */
	async hasError(): Promise< boolean > {
		return this.page.getByText( /error|failed|unable to/i ).isVisible();
	}
}
