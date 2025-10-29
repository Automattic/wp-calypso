import { Page } from 'playwright';
import { PlansPage, Plans } from '../plans-page';
import type { SiteDetails, NewSiteResponse } from '../../../types/rest-api-client.types';

/**
 * The plans page URL regex.
 */
export const plansPageUrl =
	/.*setup\/onboarding\/plans|setup\/domain\/plans|start\/plans|start\/with-theme\/plans-theme-preselected|start\/domain\/plans-site-selected.*/;

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
	 * @param {RegExp} redirectUrl Optional redirect URL to wait for.
	 * @returns {Promise<SiteDetails>} Details of the newly created site.
	 */
	async selectPlan( name: Plans, redirectUrl?: RegExp ): Promise< NewSiteResponse > {
		await this.page.waitForURL( plansPageUrl );

		if ( name !== 'Free' ) {
			// Non-free plans should redirect to the Checkout cart.
			redirectUrl ??= new RegExp( '.*checkout.*' );
		} else {
			redirectUrl ??= new RegExp( '.*setup/site-setup.*' );
		}

		const actions = [
			this.page.waitForResponse( /.*sites\/new\?.*/, { timeout: 30 * 1000 } ),
			this.page.waitForURL( redirectUrl, { timeout: 60 * 1000 } ),
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
			throw new Error( 'Failed to locate blog ID for the created site.' );
		}

		// Cast the blogID value to a number, in case it comes in as a string.
		body.blog_details.blogid = Number( body.blog_details.blogid );
		return body;
	}

	/**
	 * Selects a WordPress.com plan matching the name but does not wait for site creation
	 *
	 * The `selectPlan` method assumes that, after plan selection, a site will be created.
	 * That's not true for the domain-only flow, where a logged out user is redirected to
	 * the login step after plan selection.
	 *
	 * @param name Name of the plan.
	 * @returns {Promise<void>}
	 */
	async selectPlanWithoutSiteCreation( name: Plans, redirectUrl?: RegExp ): Promise< void > {
		await this.page.waitForURL( plansPageUrl );

		if ( name !== 'Free' ) {
			// Non-free plans should redirect to the Checkout cart.
			redirectUrl ??= new RegExp( '.*checkout.*' );
		} else {
			redirectUrl ??= new RegExp( '.*setup/site-setup.*' );
		}

		const actions = [
			this.page.waitForURL( redirectUrl, { timeout: 30 * 1000 } ),
			this.plansPage.selectPlan( name ),
		];

		await Promise.all( actions );
	}
}
