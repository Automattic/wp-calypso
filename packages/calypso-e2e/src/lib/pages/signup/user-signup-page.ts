import { Page, Locator, Frame } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';
import type { NewSiteResponse, NewUserResponse } from '../../../types/rest-api-client.types';

/**
 * Signals a transient upstream failure during signup (a 502/503/504 server-error
 * page or /users/new? response) for which retrying is safe because no account
 * was created.
 */
class TransientSignupError extends Error {}

// Upstream gateway statuses that indicate a transient infra failure rather than
// the app itself. 500 (Internal Server Error) and 501 are deliberately excluded:
// they usually mean the app crashed or a genuine bug, which we want to fail on
// fast rather than mask by retrying. Mirrors the phrases isServerErrorPage()
// matches (Bad Gateway / Service Unavailable / Gateway Timeout).
const TRANSIENT_UPSTREAM_STATUSES = [ 502, 503, 504 ];

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
		return this.page
			.waitForResponse(
				( response ) =>
					/\/users\/new\?/.test( response.url() ) &&
					response.ok() &&
					response.request().method() === 'POST',
				// Use an explicit timeout so the global actionTimeout (10s) does not
				// apply here. The form load + fill + network round-trip can easily
				// exceed 10s on a slow CI runner.
				{ timeout: 60_000 }
			)
			.then( ( response ) => response.json() );
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
		// Staging occasionally serves a transient upstream 5xx (502/503/504) for
		// the signup page or the /users/new? POST. The form then never loads or
		// the response is never ok, so the attempt fails. In the common case
		// (502 Bad Gateway, 503) the request never reached the backend, so no
		// account was created and reloading + resubmitting is safe. The rare
		// exception is a 504 where the backend created the user before the gateway
		// timed out; the same-email retry then surfaces a "user exists" error
		// instead of recovering, which is still preferable to masking the failure.
		// Retry a bounded number of times before giving up.
		const maxAttempts = 3;
		for ( let attempt = 1; attempt <= maxAttempts; attempt++ ) {
			try {
				return await this.attemptSignupWithEmail( email );
			} catch ( error ) {
				// Only retry transient upstream failures; surface anything else so
				// genuine bugs are not masked by reloads.
				if ( attempt < maxAttempts && error instanceof TransientSignupError ) {
					await this.page.reload( { waitUntil: 'domcontentloaded' } );
					continue;
				}
				throw error;
			}
		}

		// The loop above either returns a response or throws.
		throw new Error( 'Signup failed after exhausting retries.' );
	}

	/**
	 * Performs a single signup attempt: fills the email form and captures the
	 * /users/new? response. Throws a {@link TransientSignupError} when the page
	 * or the /users/new? response is a transient upstream 5xx.
	 *
	 * @param {string} email Email address of the new user.
	 * @returns {NewUserResponse} Response from the REST API.
	 */
	private async attemptSignupWithEmail( email: string ): Promise< NewUserResponse > {
		// Fail fast when the current page is already a server-error page (e.g. after
		// a reload that landed on another 502). This keeps a retry cheap instead of
		// burning the ~60s of form-wait timeouts in waitForSignupForm() before it
		// gives up, which would otherwise risk blowing the per-test budget.
		if ( await this.isServerErrorPage() ) {
			throw new TransientSignupError( 'Signup page returned a transient server error.' );
		}

		// Register the response capture before any page interactions so it cannot
		// miss the /users/new? POST if the form or network responds quickly.
		const responsePromise = this.captureNewUserResponse();
		// Watch for a 5xx /users/new? response so we can fail fast and retry
		// instead of waiting out the full capture timeout.
		const serverErrorPromise = this.captureUsersNewServerError();
		// Keep the abandoned promises from becoming unhandled rejections when the
		// other settles first (or a step below throws before they are awaited).
		responsePromise.catch( () => undefined );
		serverErrorPromise.catch( () => undefined );

		try {
			await this.waitForSignupForm();
			await this.emailInput.fill( email );

			// Trigger the signup.
			await this.submitButton.click();

			// Resolve with the user response, or reject early on a 5xx /users/new?.
			return await Promise.race( [ responsePromise, serverErrorPromise ] );
		} catch ( error ) {
			// The form never loaded because the page itself is a 5xx error page.
			if ( ! ( error instanceof TransientSignupError ) && ( await this.isServerErrorPage() ) ) {
				throw new TransientSignupError( 'Signup page returned a transient server error.' );
			}
			throw error;
		}
	}

	/**
	 * Rejects as soon as the /users/new? POST returns any 5xx, so the attempt
	 * fails fast instead of waiting out the full capture timeout. A transient
	 * upstream status (502/503/504) rejects with a {@link TransientSignupError}
	 * so the caller can retry; any other 5xx (e.g. 500 Internal Server Error)
	 * rejects with a plain Error so the run fails immediately rather than
	 * masking an app crash behind retries. Never resolves; intended to be raced
	 * against the successful response capture.
	 *
	 * @returns {Promise<never>} A promise that only rejects.
	 */
	private captureUsersNewServerError(): Promise< never > {
		return this.page
			.waitForResponse(
				( response ) =>
					/\/users\/new\?/.test( response.url() ) &&
					response.request().method() === 'POST' &&
					response.status() >= 500,
				{ timeout: 60_000 }
			)
			.then( ( response ) => {
				const status = response.status();
				const message = `/users/new? responded with status ${ status }.`;
				if ( TRANSIENT_UPSTREAM_STATUSES.includes( status ) ) {
					throw new TransientSignupError( message );
				}
				throw new Error( message );
			} );
	}

	/**
	 * Detects whether the page is currently showing a transient upstream
	 * server-error page (502/503/504), e.g. the nginx "502 Bad Gateway" page.
	 *
	 * @returns {Promise<boolean>} True when a server-error page is detected.
	 */
	private async isServerErrorPage(): Promise< boolean > {
		return this.page
			.evaluate( () => {
				const title = document.title || '';
				const heading = document.querySelector( 'h1' )?.textContent || '';
				// Match the upstream error phrases (e.g. nginx "502 Bad Gateway")
				// rather than a bare status number, which could appear incidentally
				// in legitimate page text.
				return /Bad Gateway|Service (Temporarily )?Unavailable|Gateway Time-?out/i.test(
					`${ title } ${ heading }`
				);
			} )
			.catch( () => false );
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
