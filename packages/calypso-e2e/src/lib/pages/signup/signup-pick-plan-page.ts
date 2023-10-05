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
	private selectedDomain?: string;

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

		// Free plan with free domain would redirect immediately to the site setup process.
		// Free plan with custom domain that accepted upsell, or paid plans would
		// go to the checkout.

		// Select the plan.
		await this.plansPage.selectPlan( name );

		// Handle the situation where if a custom domain is selected, but the user attempts to
		// select the Free plan, we show an upsell modal.
		const planUpsellAcceptButton = this.page
			.getByRole( 'dialog' )
			.getByRole( 'button', { name: name } );
		if ( await planUpsellAcceptButton.count() ) {
			await this.page
				.getByRole( 'dialog' )
				.getByRole( 'button', { name: `Continue with ${ name }` } )
				.click();
		}

		// Resolve the promises that check for transition onto the next step of the stepper,
		// and whether the site creation request has been kicked off.
		const [ response ] = await Promise.all( [
			this.page.waitForResponse( /sites\/new/, { timeout: 30 * 1000 } ),
			this.page.waitForURL( /(setup\/site-setup|checkout)/, { timeout: 30 * 1000 } ),
		] );

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
