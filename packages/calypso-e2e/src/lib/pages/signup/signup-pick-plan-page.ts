import { Page } from 'playwright';
import { PlansPage, Plans } from '../plans-page';
import type { SiteDetails, NewSiteResponse } from '../../../types/rest-api-client.types';

/**
 * The plans page URL regex.
 */
export const plansPageUrl =
	/.*setup\/onboarding\/plans|start\/plans|start\/with-theme\/plans-theme-preselected.*/;

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
		await this.page.waitForURL( plansPageUrl );

		let url: RegExp;
		if ( name !== 'Free' ) {
			// Non-free plans should redirect to the Checkout cart.
			url = new RegExp( '.*checkout.*' );
		} else {
			url = new RegExp( '.*setup/site-setup.*' );
		}

		const actions = [
			this.page.waitForResponse( /.*sites\/new\?.*/, { timeout: 30 * 1000 } ),
			this.page.waitForURL( url, { timeout: 30 * 1000 } ),
			this.plansPage.selectPlan( name ),
		];

		const [ response ] = await Promise.all( actions );

		if ( ! response ) {
			throw new Error( 'Failed to intercept response for new site creation.' );
		}

		const responseJSON = await response.json();
		const body: NewSiteResponse = responseJSON.body;

		if ( ! body.blog_details.blogid ) {
			console.error( body );
			throw new Error( `Failed to locate blog ID for the created site.` );
		}

		// Cast the blogID value to a number, in case it comes in as a string.
		body.blog_details.blogid = Number( body.blog_details.blogid );
		return body;
	}
}
