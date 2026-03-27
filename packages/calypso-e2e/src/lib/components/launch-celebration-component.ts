import { Locator, Page } from 'playwright';

/**
 * Component representing the site launch celebration modal.
 *
 * This modal appears on the `/home` page after a site is successfully launched,
 * typically triggered via the `celebrateLaunch` URL parameter.
 */
export class LaunchCelebrationComponent {
	private page: Page;
	readonly heading: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.heading = this.page.getByRole( 'heading', { name: 'Congrats, your site is live!' } );
	}

	/**
	 * Validates that the launch celebration modal is visible.
	 *
	 * Waits for the "Congrats, your site is live!" heading to appear on the page.
	 */
	async validateVisible(): Promise< void > {
		await this.heading.waitFor();
	}
}
