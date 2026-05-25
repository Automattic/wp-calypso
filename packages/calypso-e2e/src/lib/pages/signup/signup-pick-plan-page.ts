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
	 * Captures the response from the site creation API endpoint via route
	 * interception to avoid the race where the page navigates away before
	 * the response body can be read through CDP.
	 *
	 * @see test/e2e/docs-new/creating_reliable_tests.md
	 * @returns {Promise<NewSiteResponse>}
	 */
	private captureNewSiteResponse(): Promise< NewSiteResponse > {
		return new Promise< NewSiteResponse >( ( resolve, reject ) => {
			this.page.route(
				/.*\/sites\/new\?.*/,
				async ( route ) => {
					try {
						const response = await route.fetch();
						const body = await response.body();
						await route.fulfill( { response } );

						const parsed = JSON.parse( body.toString() );
						const siteDetails: NewSiteResponse = parsed.body;

						if ( ! siteDetails.blog_details.blogid ) {
							console.error( siteDetails );
							reject( new Error( 'Failed to locate blog ID for the created site.' ) );
							return;
						}

						siteDetails.blog_details.blogid = Number( siteDetails.blog_details.blogid );
						resolve( siteDetails );
					} catch ( error ) {
						reject( error );
					}
				},
				{ times: 1 }
			);
		} );
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

		const responsePromise = this.captureNewSiteResponse();

		await Promise.all( [
			this.page.waitForURL( redirectUrl, { timeout: 90 * 1000 } ),
			this.plansPage.selectPlan( name ),
		] );

		return responsePromise;
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
			this.page.waitForURL( redirectUrl, { timeout: 60 * 1000 } ),
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
			this.page.waitForURL( redirectUrl, { timeout: 60 * 1000 } ),
			this.plansPage.selectModalUpsellPlan( planName ),
		];

		await Promise.all( actions );
	}

	/**
	 * Opens the escape hatch modal by clicking the "start with a free plan" trigger.
	 *
	 * Use this when you need to inspect or assert modal content before committing to a plan.
	 *
	 * @returns {Promise<void>}
	 */
	async openEscapeHatch(): Promise< void > {
		await this.page.waitForURL( plansPageUrl );
		await this.plansPage.openEscapeHatch();
	}

	/**
	 * Validates that the "No free custom domain" warning is visible in the escape hatch modal.
	 *
	 * @param {string} domainName The domain name that will be shown to visitors.
	 * @returns {Promise<void>}
	 */
	async validateNoCustomDomainWarning( domainName: string ): Promise< void > {
		await this.plansPage.validateNoCustomDomainWarning( domainName );
	}

	/**
	 * Validates that the "Domain redirect" warning is visible in the escape hatch modal.
	 *
	 * @param {string} domainName The domain name that will be shown to visitors.
	 * @param {string} siteSlug The site slug.
	 * @returns {Promise<void>}
	 */
	async validateDomainRedirectWarning( domainName: string, siteSlug: string ): Promise< void > {
		await this.plansPage.validateDomainRedirectWarning( domainName, siteSlug );
	}

	/**
	 * Returns the domain shown in the "Domain redirect" warning.
	 *
	 * @param {string} siteSlug The site slug.
	 * @returns {Promise<string>} Domain shown in the redirect warning.
	 */
	async getDomainFromRedirectWarning( siteSlug: string ): Promise< string > {
		return this.plansPage.getDomainFromRedirectWarning( siteSlug );
	}

	/**
	 * Returns the domain shown as included on the plans grid.
	 *
	 * @returns {Promise<string>} Domain shown as included.
	 */
	async getIncludedDomain(): Promise< string > {
		return this.plansPage.getIncludedDomain();
	}

	/**
	 * Clicks the "Continue with Free" button in the escape hatch modal and waits for navigation.
	 *
	 * Intended for use after `openEscapeHatch()` when skipping to a free plan with no domain.
	 *
	 * @param {RegExp} redirectUrl Optional URL pattern to wait for after clicking.
	 * @returns {Promise<void>}
	 */
	async continueWithFreeViaEscapeHatch( redirectUrl?: RegExp ): Promise< void > {
		redirectUrl ??= new RegExp( '.*/home/.*' );

		await Promise.all( [
			this.page.waitForURL( redirectUrl, { timeout: 60 * 1000 } ),
			this.plansPage.clickContinueWithFree(),
		] );
	}
}
