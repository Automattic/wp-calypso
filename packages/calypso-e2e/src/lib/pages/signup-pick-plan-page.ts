import { Page } from 'playwright';
import { NewSiteResponse } from '../../rest-api-client';
import { PlansPage, Plans } from './plans-page';

interface NewSiteDetails {
	id: string;
	url: string;
	name: string;
}

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
	 */
	async selectPlan( name: Plans ): Promise< NewSiteDetails > {
		const [ response ] = await Promise.all( [
			this.page.waitForResponse( /.*sites\/new\?.*/ ),
			this.plansPage.selectPlan( name ),
		] );

		if ( ! response ) {
			throw new Error( 'Failed to create new site at Signup.' );
		}

		const responseBody: NewSiteResponse = JSON.parse( ( await response.body() ).toString() );
		return {
			id: responseBody.body.blog_details.blogid,
			url: responseBody.body.blog_details.url,
			name: responseBody.body.blog_details.blogname,
		};
	}
}
