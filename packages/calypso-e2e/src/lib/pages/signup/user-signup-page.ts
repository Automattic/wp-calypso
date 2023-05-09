import { Page } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';
import envVariables from '../../../env-variables';
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
	 * Signup form that is used by WordPress.com Connect (WPCC) endpoint.
	 *
	 * WPCC is a single sign-on service. For more information, please see
	 * https://wordpress.com/support/wpcc-faq/.
	 *
	 * @param {string} email Email address of the new user.
	 * @param {string} password Password of the new user.
	 * @returns {NewUserResponse} Response from the REST API.
	 */
	async signupWPCC( email: string, password: string ): Promise< NewUserResponse > {
		// On mobile devices, the signup form is not shown by default.
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.page.click( selectors.createWPCOMAccountButton );
		}

		await this.page.fill( selectors.firstNameInput, 'E2E' );
		await this.page.fill( selectors.lastNameInput, 'Testing' );
		await this.page.fill( selectors.emailInput, email );
		await this.page.fill( selectors.passwordInput, password );

		const [ , response ] = await Promise.all( [
			this.page.waitForURL( /.*crowdsignal\.com\/start\?plan=free.*/ ),
			this.page.waitForResponse( /.*new\?.*/ ),
			this.page.click( selectors.submitButton ),
		] );

		if ( ! response ) {
			throw new Error( 'Failed to create new user at CrowdSignal using WPCC.' );
		}

		const responseBody: NewUserResponse = await response.json();

		return responseBody;
	}
}
