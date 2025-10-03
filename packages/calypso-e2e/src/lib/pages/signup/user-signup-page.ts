import { Page, Locator, Frame } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';
import type { NewUserResponse } from '../../../types/rest-api-client.types';
const selectors = {
	// Fields
	emailInput: 'input[name="email"]',
	usernameInput: 'input[name="username"]',
	passwordInput: 'input[name="password"]',

	// WPCC specific fields
	createWPCOMAccountButton: 'button:text("Create a WordPress.com Account"):visible',
	firstNameInput: 'input[name="firstName"]',
	lastNameInput: 'input[name="lastName"]',

	// Buttons
	submitButton: 'button[type="submit"]',
	createAccountButton: 'button:text("Create an account")',
};

/**
 * This object represents multiple pages on WordPress.com:
 * 	- regular (/start/user)
 * 	- gutenboarding (/new)
 * 	- wpcc
 *	- invitation signup
 */
export class UserSignupPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
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
	 * Fill out required information then submit the form to complete the signup.
	 *
	 * @param {string} email Email address of the new user.
	 * @param {string} username Username of the new user.
	 * @param {string} password Password of the new user.
	 * @returns Response from the REST API.
	 */
	async signup( email: string, username: string, password: string ): Promise< NewUserResponse > {
		await this.page.fill( selectors.emailInput, email );
		await this.page.fill( selectors.usernameInput, username );
		await this.page.fill( selectors.passwordInput, password );

		// Use CSS selector instead of text.
		// Text displayed on button changes depending on the link directing
		// user to this page.
		// Example: invite => Signup & Follow
		//          signup from login => Create your account
		const [ , response ] = await Promise.all( [
			this.page.waitForNavigation(),
			this.page.waitForResponse( /.*new\?.*/ ),
			this.page.click( selectors.submitButton ),
		] );

		if ( ! response ) {
			throw new Error( 'Failed to create new user at signup.' );
		}

		const responseBody: NewUserResponse = await response.json();

		return responseBody;
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
		await this.page.fill( selectors.emailInput, email );

		// Click the button first, then wait for the response
		await this.page.click( selectors.submitButton );

		const response = await this.page.waitForResponse( /.*new\?.*/ );

		if ( ! response ) {
			throw new Error( 'Failed to sign up as new user: no or unexpected API response.' );
		}

		return await response.json();
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
		try {
			const continueWithEmailButton = this.page.getByRole( 'button', {
				name: 'Continue with email',
			} );

			await continueWithEmailButton.click();

			return this.signupWithEmail( email );
		} catch ( error ) {
			console.error( 'Failed to sign up as new user:', error );
			return this.signupWithEmail( email );
		}
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
		await this.page.fill( selectors.emailInput, email );

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
		await this.page.click( selectors.submitButton );

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
		await this.page.fill( selectors.emailInput, email );

		const [ response ] = await Promise.all( [
			this.page.waitForResponse( /\/users\/new\?[^?]*$/ ),
			this.page.click( selectors.createAccountButton ),
		] );

		if ( ! response ) {
			throw new Error( 'Failed to create new user through invite.' );
		}

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
