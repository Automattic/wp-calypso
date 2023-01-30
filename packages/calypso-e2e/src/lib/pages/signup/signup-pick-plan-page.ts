import { Page } from 'playwright';
import { PlansPage, Plans } from '../plans-page';
import type { SiteDetails, NewSiteResponse } from '../../../types/rest-api-client.types';

/**
 * Represents the Signup > Pick a Plan page.
 *
 * With the overhauled Plans, this class is a thin wrapper around the PlansPage object.
 */
export class SignupPickPlanPage {
	private page: Page;
	private plansPage: PlansPage;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.plansPage = new PlansPage( page );
	}

	/**
	 * Selects a WordPress.com plan matching the name, triggering site creation.
	 *
	 * @param {Plans} name Name of the plan.
	 * @returns {Promise<SiteDetails>} Details of the newly created site.
	 */
	async selectPlan( name: Plans ): Promise< NewSiteResponse > {
		await Promise.all( [
			this.page.waitForURL( /.*start\/plans.*/ ),
			this.page.waitForLoadState(),
		] );

		const [ response ] = await Promise.all( [
			this.page.waitForResponse( /.*sites\/new\?.*/ ),
			// Should redirect to the Checkout cart and this may
			// take some time.
			this.page.waitForURL( /.*checkout.*/, { timeout: 30 * 1000 } ),
			this.plansPage.selectPlan( name ),
		] );

		const responseJSON = await response.json();
		const body: NewSiteResponse = responseJSON.body;

		if ( ! body.blog_details.blogid ) {
			console.error( body );
			throw new Error( 'Failed to create new site when selecting a plan at signup.' );
		}

		// Cast the blogID value to a number, in case it comes in as a string.
		body.blog_details.blogid = Number( body.blog_details.blogid );
		return body;
	}
}
