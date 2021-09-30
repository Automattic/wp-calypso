import { Page } from 'playwright';
import { getTargetDeviceName } from '../../browser-helper';

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
	 * Fill out required information then submit the form to complete the signup.
	 *
	 * @param {string} email Email address of the new user.
	 * @param {string} username Username of the new user.
	 * @param {string} password Password of the new user.
	 */
	async signup( email: string, username: string, password: string ): Promise< void > {
		await this.page.fill( selectors.emailInput, email );
		await this.page.fill( selectors.usernameInput, username );
		await this.page.fill( selectors.passwordInput, password );

		// Use CSS selector instead of text.
		// Text displayed on button changes depending on the link directing
		// user to this page.
		// Example: invite => Signup & Follow
		//          signup from login => Create your account
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.submitButton ),
		] );
	}

	/**
	 * Signup form that is used by WordPress.com Connect (WPCC) endpoint.
	 *
	 * WPCC is a single sign-on service. For more information, please see
	 * https://wordpress.com/support/wpcc-faq/.
	 *
	 * @param {string} email Email address of the new user.
	 * @param {string} password Password of the new user.
	 */
	async signupWPCC( email: string, password: string ): Promise< void > {
		const target = getTargetDeviceName();

		// On mobile devices, the signup form is not shown by default.
		if ( target === 'mobile' ) {
			await this.page.click( selectors.createWPCOMAccountButton );
		}

		await this.page.fill( selectors.firstNameInput, 'E2E' );
		await this.page.fill( selectors.lastNameInput, 'Testing' );
		await this.page.fill( selectors.emailInput, email );
		await this.page.fill( selectors.passwordInput, password );

		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.submitButton ),
		] );
	}
}
