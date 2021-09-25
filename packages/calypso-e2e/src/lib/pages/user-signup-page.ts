import { Page } from 'playwright';

const selectors = {
	// Fields
	emailInput: 'input[name="email"]',
	usernameInput: 'input[name="username"]',
	passwordInput: 'input[name="password"]',

	// Buttons
	submitButton: 'button.signup-form__submit',
};

/**
 * Represents the Invitation User Signup Page.
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
}
