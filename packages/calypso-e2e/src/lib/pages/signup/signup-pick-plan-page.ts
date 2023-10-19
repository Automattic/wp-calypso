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
	 * @param {string} selectedDomain The selected domain in the previous step.
	 */
	constructor( page: Page, selectedDomain?: string ) {
		this.page = page;
		this.plansPage = new PlansPage( page );
		this.selectedDomain = selectedDomain;
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

		let url: RegExp;
		let actions: Array< Promise< any > > = [];
		if ( name !== 'Free' ) {
			// Non-free plans should redirect to the Checkout cart.
			url = new RegExp( '.*checkout.*' );
		} else {
			url = new RegExp( '.*setup/site-setup.*' );
		}

		if ( name === 'Free' ) {
			if (
				this.selectedDomain?.includes( 'wordpress.com' ) &&
				this.page.url().includes( 'onboarding-pm' )
			) {
				/** Shows a modal */
				await this.plansPage.selectPlan( name );
				actions = [
					this.page.waitForResponse( /.*sites\/new\?.*/ ),
					this.page.waitForURL( url, { timeout: 30 * 1000 } ),
					this.plansPage.selectModalUpsellPlan( name ),
				];
			}
		} else if ( actions.length === 0 ) {
			actions = [
				this.page.waitForResponse( /.*sites\/new\?.*/ ),
				this.page.waitForURL( url, { timeout: 30 * 1000 } ),
				this.plansPage.selectPlan( name ),
			];
		}

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
