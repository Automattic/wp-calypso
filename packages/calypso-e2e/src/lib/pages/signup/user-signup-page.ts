import { Page, Locator, Frame } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';
import type { NewSiteResponse, NewUserResponse } from '../../../types/rest-api-client.types';

/**
 * This object represents multiple pages on WordPress.com:
 * 	- regular (/start/user)
 * 	- gutenboarding (/new)
 * 	- wpcc
 *	- invitation signup
 */
export class UserSignupPage {
	private page: Page;

	readonly createYourAccountHeading: Locator;
	readonly emailInput: Locator;
	readonly usernameInput: Locator;
	readonly passwordInput: Locator;
	readonly firstNameInput: Locator;
	readonly lastNameInput: Locator;
	readonly submitButton: Locator;
	readonly continueButton: Locator;
	readonly createWPCOMAccountButton: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;

		this.createYourAccountHeading = this.page.getByRole( 'heading', {
			name: 'Create your account',
		} );
		this.emailInput = this.page.locator( 'input[name="email"]' );
		this.usernameInput = this.page.locator( 'input[name="username"]' );
		this.passwordInput = this.page.locator( 'input[name="password"]' );
		this.firstNameInput = this.page.locator( 'input[name="firstName"]' );
		this.lastNameInput = this.page.locator( 'input[name="lastName"]' );
		this.submitButton = this.page.locator( 'button[type="submit"]' );
		this.continueButton = this.page.locator( 'button:text("Continue")' );
		this.createWPCOMAccountButton = this.page.locator(
			'button:text("Create a WordPress.com Account"):visible'
		);
	}

	/**
	 * Waits for the signup form to be ready for interaction.
	 * We consider the form ready when either the "Create your account" heading
	 * or the email input is visible and actionable.
	 */
	private async waitForSignupForm(): Promise< void > {
		const continueWithEmailButton = this.page.getByRole( 'button', {
			name: /continue with email/i,
		} );
		const useEmailInsteadButton = this.page.getByRole( 'button', {
			name: /use email/i,
		} );
		const waitForAttached = ( locator: Locator ) =>
			locator.waitFor( { state: 'attached', timeout: 30_000 } ).catch( () => null );

		// Race heading vs input availability to be resilient to layout variants.
		await Promise.race( [
			this.createYourAccountHeading
				.waitFor( { state: 'visible', timeout: 30_000 } )
				.catch( () => null ),
			waitForAttached( this.emailInput ),
			waitForAttached( continueWithEmailButton ),
			waitForAttached( useEmailInsteadButton ),
			waitForAttached( this.createWPCOMAccountButton ),
		] );

		const ensureEmailVisible = async () => {
			await this.emailInput.waitFor( { state: 'visible', timeout: 30_000 } );
		};

		let emailVisible = false;
		try {
			await this.emailInput.waitFor( { state: 'attached', timeout: 5_000 } );
			emailVisible = await this.emailInput.isVisible();
		} catch {
			emailVisible = false;
		}

		if ( ! emailVisible ) {
			const candidateButtons = [
				continueWithEmailButton,
				useEmailInsteadButton,
				this.createWPCOMAccountButton,
			];

			for ( const button of candidateButtons ) {
				try {
					if ( await button.isVisible() ) {
						await button.scrollIntoViewIfNeeded();
						await button.click();
						break;
					}
				} catch {
					// Ignore button interaction failures; another button may be present instead.
				}
			}

			await this.emailInput.waitFor( { state: 'attached', timeout: 30_000 } );
			await ensureEmailVisible();
		} else {
			await ensureEmailVisible();
		}

		await this.emailInput.scrollIntoViewIfNeeded();
	}

	/**
	 * Navigates to the /start endpoint.
	 *
	 * @param {{path: string}: string } param1 Key/value pair of the path to be appended to /start. E.g. /start/premium is the premium plan signup flow.
	 */
	async visit( { path }: { path: string } = { path: '' } ): Promise< void > {
		const targetUrl = path ? `start/${ path }` : 'start';
		await this.page.goto( getCalypsoURL( targetUrl ), { waitUntil: 'networkidle' } );
	}
	/**
	 * Captures the response from the user creation API endpoint.
	 * @returns {Promise<NewUserResponse>}
	 */
	private captureNewUserResponse(): Promise< NewUserResponse > {
		return new Promise< NewUserResponse >( ( resolve, reject ) => {
			this.page.route(
				/.*\/users\/new\?.*/,
				async ( route ) => {
					try {
						const response = await route.fetch();
						const body = await response.body();
						// Fulfill the original request
						await route.fulfill( { response } );
						// Resolve the promise with the parsed body
						resolve( JSON.parse( body.toString() ) as NewUserResponse );
					} catch ( error ) {
						reject( error );
					}
				},
				{ times: 1 }
			);
		} );
	}

	/**
	 * Fill out required information then submit the form to complete the signup.
	 *
	 * @param {string} email Email address of the new user.
	 * @param {string} username Username of the new user.
	 * @param {string} password Password of the new user.
	 * @returns Response from the REST API.
	 */
	async signup( email: string, username: string, password: string ): Promise< NewUserResponse > {
		await this.waitForSignupForm();
		await this.emailInput.fill( email );
		await this.usernameInput.fill( username );
		await this.passwordInput.fill( password );

		const responsePromise = this.captureNewUserResponse();

		// Trigger the signup and wait for the captured response.
		await this.submitButton.click();
		return responsePromise;
	}

	/**
	 * Using the unified signup form, fill out required information
	 * and then submit the form to complete the signup.
	 *
	 * @see https://linear.app/a8c/issue/DOTCOM-13218/signup-update-and-unify-the-create-account-screens
	 *
	 * @param {string} email Email address of the new user.
	 * @returns {NewUserResponse} Response from the REST API.
	 */
	async signupWithEmail( email: string ): Promise< NewUserResponse > {
		await this.waitForSignupForm();
		await this.emailInput.fill( email );

		const responsePromise = this.captureNewUserResponse();

		// Trigger the signup.
		await this.submitButton.click();

		// Wait for the promise to be resolved by the route handler.
		return responsePromise;
	}

	/**
	 * Signup with email and wait for site creation.
	 *
	 * This happens in the domain-only flow, where site creation happens after user login.
	 *
	 * @param email {string} Email address of the new user.
	 * @returns {NewUserResponse, NewSiteResponse} Details of the new user and the newly created site.
	 */
	async signupWithEmailAndWaitForSiteCreation(
		email: string
	): Promise< [ NewUserResponse, NewSiteResponse ] > {
		const newUserDetails = await this.signupWithEmail( email );
		const newSiteDetails = await this.waitForSiteCreation();
		return [ newUserDetails, newSiteDetails ];
	}

	/**
	 * Waits for the site creation response and returns the details of the newly created site.
	 *
	 * Site creation happens with the `/sites/new` endpoint call
	 *
	 * @returns {NewSiteResponse} Details of the newly created site.
	 */
	private async waitForSiteCreation(): Promise< NewSiteResponse > {
		const response = await this.page.waitForResponse( /.*sites\/new\?.*/, { timeout: 30 * 1000 } );

		if ( ! response ) {
			throw new Error( 'Failed to intercept response for new site creation.' );
		}

		const responseJSON = await response.json();
		const body = responseJSON.body;

		if ( ! body.blog_details.blogid ) {
			console.error( body );
			throw new Error( 'Failed to locate blog ID for the created site.' );
		}

		// Cast the blogID value to a number, in case it comes in as a string.
		body.blog_details.blogid = Number( body.blog_details.blogid );
		return body;
	}

	/**
	 * Using the Social First signup, selects the Email option, then fill out required information
	 * and then submit the form to complete the signup.
	 *
	 * @see https://github.com/Automattic/wp-calypso/pull/82481
	 *
	 * @param {string} email Email address of the new user.
	 * @returns {NewUserResponse} Response from the REST API.
	 */
	async signupSocialFirstWithEmail( email: string ): Promise< NewUserResponse > {
		const continueWithEmailButton = this.page.getByRole( 'button', {
			name: 'Continue with email',
		} );

		// The "Continue with email" button is only shown on certain flows.
		// If present, click it explicitly (avoid relying on LocatorHandler timing).
		if ( await continueWithEmailButton.isVisible() ) {
			await continueWithEmailButton.scrollIntoViewIfNeeded();
			await continueWithEmailButton.click();
		}

		return this.signupWithEmail( email );
	}

	/**
	 * Signup form that is used by WordPress.com Connect (WPCC) endpoint.
	 *
	 * WPCC is a single sign-on service. For more information, please see
	 * https://wordpress.com/support/wpcc-faq/.
	 *
	 * @param {string} email Email address of the new user.
	 * @returns {NewUserResponse} Response from the REST API.
	 */
	async signupWPCC( email: string ): Promise< NewUserResponse > {
		return this.signupWithEmail( email );
	}

	/**
	 * Signup form that is used by WordPress.com Connect (WPCC) endpoint for WooCommerce.
	 *
	 * WPCC is a single sign-on service. For more information, please see
	 * https://wordpress.com/support/wpcc-faq/.
	 *
	 * @param {string} email Email address of the new user.
	 * @returns {NewUserResponse} Response from the REST API.
	 */
	async signupWoo( email: string ): Promise< NewUserResponse > {
		await this.waitForSignupForm();
		await this.emailInput.fill( email );

		// Detect redirection without keeping the listener around
		const redirectDetected = new Promise< string >( ( resolve ) => {
			const handler = ( frame: Frame ) => {
				const url = frame.url();
				if ( /.*woocommerce\.com*/.test( url ) ) {
					this.page.off( 'framenavigated', handler ); // Remove listener after use
					resolve( url );
				}
			};
			this.page.on( 'framenavigated', handler );
		} );

		// Ensure response is captured correctly
		const responsePromise = this.page.waitForResponse( /\/users\/new\?[^?]*$/ );
		await this.submitButton.click();

		const [ response ] = await Promise.all( [ responsePromise, redirectDetected ] );

		if ( ! response ) {
			throw new Error( 'Failed to create new user at WooCommerce using WPCC.' );
		}

		const responseBody: NewUserResponse = await response.json();
		return responseBody;
	}

	/**
	 * Signs up through an invite acceptance flow.
	 *
	 * @param {string} email Email address of the new user.
	 * @returns {NewUserResponse} Response from the REST API.
	 */
	async signupThroughInvite( email: string ): Promise< NewUserResponse > {
		await this.emailInput.fill( email );

		const responsePromise = this.page.waitForResponse(
			( response ) => /\/users\/new\?[^?]*$/.test( response.url() ) && response.ok()
		);
		await this.continueButton.click();
		const response = await responsePromise;

		return await response.json();
	}

	/**
	 * Clicks the "Continue with Google" link.
	 *
	 * @returns {Promise<Page>} Handler to the popup page.
	 */
	async clickContinueWithGoogle(): Promise< Page > {
		const locator = this.page.getByRole( 'button', { name: 'Continue with Google' } );

		await locator.waitFor();
		await locator.scrollIntoViewIfNeeded();

		// Intercept the popup that appears when Login with Google button
		// is clicked.
		const [ page ] = await Promise.all( [ this.page.waitForEvent( 'popup' ), locator.click() ] );

		return page;
	}

	/**
	 * Clicks the "Continue with Apple" link.
	 */
	async clickContinueWithApple(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Continue with Apple")' );
		await locator.click();

		return locator;
	}
}
