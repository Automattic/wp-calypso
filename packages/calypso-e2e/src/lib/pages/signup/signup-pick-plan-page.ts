import { Locator, Page } from 'playwright';
import { PlansPage, Plans } from '../plans-page';
import type { NewSiteResponse } from '../../../types/rest-api-client.types';

/**
 * The plans page URL regex.
 */
export const plansPageUrl =
	/.*setup\/onboarding\/plans|setup\/domain\/plans|start\/plans|start\/with-theme\/plans-theme-preselected|start\/domain\/plans-site-selected|start\/launch-site\/plans-launch.*/;

/**
 * Represents the Signup > Pick a Plan page.
 *
 * With the overhauled Plans, this class is a thin wrapper around the PlansPage object.
 */
export class SignupPickPlanPage {
	private page: Page;
	private plansPage: PlansPage;
	readonly theresAPlanForYouHeading: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.plansPage = new PlansPage( page );
		this.theresAPlanForYouHeading = this.page.getByRole( 'heading', {
			name: 'There’s a plan for you',
		} );
	}

	/**
	 * Captures the response from the site creation API endpoint.
	 * @returns {Promise<NewSiteResponse>}
	 */
	private async captureNewSiteResponse(): Promise< NewSiteResponse > {
		const response = await this.page.waitForResponse( /.*\/sites\/new\?.*/, {
			timeout: 60 * 1000,
		} );

		const responseJSON = await response.json();
		const body: NewSiteResponse = responseJSON.body;

		if ( ! body.blog_details.blogid ) {
			console.error( body );
			throw new Error( 'Failed to locate blog ID for the created site.' );
		}

		body.blog_details.blogid = Number( body.blog_details.blogid );
		return body;
	}

	/**
	 * Selects a WordPress.com plan matching the name, triggering site creation.
	 *
	 * @param {Plans} name Name of the plan.
	 * @returns {Promise<NewSiteResponse>} Details of the newly created site.
	 */
	async selectPlan( name: Plans, redirectUrl?: RegExp ): Promise< NewSiteResponse > {
		await this.page.waitForURL( plansPageUrl );

		if ( name !== 'Free' ) {
			// Non-free plans should redirect to the Checkout cart.
			redirectUrl ??= new RegExp( '.*checkout.*' );
		} else {
			redirectUrl ??= new RegExp( '.*(setup/site-setup|home/.+ref=onboarding).*' );
		}

		const [ , , response ] = await Promise.all( [
			this.page.waitForURL( redirectUrl, { timeout: 60 * 1000 } ),
			this.plansPage.selectPlan( name ),
			this.captureNewSiteResponse(),
		] );

		return response;
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
			redirectUrl ??= new RegExp( '.*(setup/site-setup|home/.+ref=onboarding).*' );
		}

		const actions = [
			this.page.waitForURL( redirectUrl, { timeout: 30 * 1000 } ),
			this.plansPage.selectPlan( name ),
		];

		await Promise.all( actions );
	}

	/**
	 * Selects the Free plan escape hatch on the modal upsell.
	 *
	 * @param {Plans} planName Name of the plan.
	 * @param {RegExp} redirectUrl Optional redirect URL to wait for.
	 * @returns {Promise<void>}
	 */
	async selectEscapeHatchWithoutSiteCreation(
		planName: Plans,
		redirectUrl?: RegExp
	): Promise< void > {
		await this.page.waitForURL( plansPageUrl );

		redirectUrl ??= new RegExp( '.*checkout.*' );

		const actions = [
			this.page.waitForURL( redirectUrl, { timeout: 30 * 1000 } ),
			this.plansPage.selectModalUpsellPlan( planName ),
		];

		await Promise.all( actions );
	}
}
