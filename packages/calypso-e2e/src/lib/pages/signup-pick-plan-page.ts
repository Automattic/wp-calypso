import { Page } from 'playwright';
import { PlansPage, Plans } from './plans-page';
import type { SiteDetails, NewSiteResponse } from '../../types/rest-api-client.types';

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
		this.plansPage = new PlansPage( page, 'current' );
	}

	/**
	 * Selects a WordPress.com plan matching the name, triggering site creation.
	 *
	 * @param {Plans} name Name of the plan.
	 * @returns {Promise<SiteDetails>} Details of the newly created site.
	 */
	async selectPlan( name: Plans ): Promise< SiteDetails > {
		const [ response ] = await Promise.all( [
			this.page.waitForResponse( /.*sites\/new\?.*/ ),
			this.plansPage.selectPlan( name ),
		] );

		if ( ! response ) {
			throw new Error( 'Failed to create new site when selecting a plan at signup.' );
		}

		const responseBody: NewSiteResponse = await response.json();

		return {
			id: responseBody.body.blog_details.blogid,
			url: responseBody.body.blog_details.url,
			name: responseBody.body.blog_details.blogname,
		};
	}
}
