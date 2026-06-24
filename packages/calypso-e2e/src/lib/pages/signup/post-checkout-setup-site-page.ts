import { Locator, Page } from 'playwright';

/**
 * Represents the post-checkout "Set up your site" choice screen that eligible
 * paid-plan users land on after checkout in the onboarding flow
 * (`/setup/onboarding/setup-your-site-ai`).
 *
 * The screen offers a choice between "Build with AI" and a manual / blank-site
 * setup. Flow tests reaching it generally navigate on to a specific page of
 * their own, so this object just exposes a check that the screen was rendered —
 * which confirms checkout completed and routed here.
 */
export class PostCheckoutSetupSitePage {
	private page: Page;
	readonly heading: Locator;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.heading = this.page.getByRole( 'heading', { name: 'Set up your site' } );
	}

	/**
	 * Waits for the choice screen to be displayed.
	 *
	 * Allows a generous timeout because the user reaches this screen straight
	 * after the post-checkout processing step.
	 *
	 * @param {number} timeout Maximum time to wait, in milliseconds.
	 */
	async waitUntilLoaded( timeout = 60 * 1000 ): Promise< void > {
		await this.heading.waitFor( { state: 'visible', timeout } );
	}
}
