import { Locator, Page, Response } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

/**
 * Represents the WPCOM login page.
 */
export class LoginPage {
	private page: Page;

	/**
	 * Constructs an instance of the LoginPage.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Opens the login page.
	 *
	 * @param {{path: string}: string } param1 Key/value pair of the path to be appended to /log-in. E.g. /log-in/new.
	 * Example: {@link https://wordpress.com/log-in}
	 */
	async visit( { path }: { path: string } = { path: '' } ): Promise< Response | null > {
		const targetUrl = path ? `log-in/${ path }` : 'log-in';
		// We are getting a pending status for https://wordpress.com/cspreport intermittently
		// which causes the login to hang on networkidle when running the tests locally.
		// This fulfill's the route request with status 200.
		// See https://github.com/Automattic/wp-calypso/issues/69294
		await this.page.route( '**/cspreport', ( route ) => {
			route.fulfill( {
				status: 200,
			} );
		} );
		return await this.page.goto( getCalypsoURL( targetUrl ) );
	}

	/**
	 * Logs in using provided account credentials.
	 */
	async logInWithCredentials( username: string, password: string ): Promise< void > {
		await this.fillUsername( username );
		await this.clickSubmit();
		await this.fillPassword( password );
		await Promise.all( [
			this.page.waitForNavigation( { timeout: 20 * 1000 } ),
			this.clickSubmit(),
		] );
	}

	/**
	 * Submits provided verification code.
	 */
	async submitVerificationCode( code: string ): Promise< void > {
		await this.fillVerificationCode( code );
		await Promise.all( [ this.page.waitForNavigation(), this.clickSubmit() ] );
	}

	/**
	 * Fills the username input.
	 */
	async fillUsername( value: string ): Promise< Locator > {
		const locator = await this.page.locator( 'input[name="usernameOrEmail"]' );
		await locator.fill( value );

		return locator;
	}

	/**
	 * Fills the password input.
	 */
	async fillPassword( value: string ): Promise< Locator > {
		const locator = await this.page.locator( 'input#password' );
		await locator.fill( value );

		return locator;
	}

	/**
	 * Fills the verification code input.
	 *
	 * The input appears after submitting the login form, if the 2fa
	 * authentication is turned on for the current account.
	 */
	async fillVerificationCode( value: string ): Promise< Locator > {
		const locator = await this.page.locator( 'input[name="twoStepCode"]' );
		await locator.fill( value );

		return locator;
	}

	/**
	 * Clicks the submit button, e.g. for the login form.
	 */
	async clickSubmit(): Promise< Locator > {
		const locator = await this.page.locator( 'button[type="submit"]' );
		await locator.click();

		return locator;
	}

	/**
	 * Clicks the "Continue with Google" link.
	 *
	 * @returns {Promise<Page>} Handler to the popup page.
	 */
	async clickLoginWithGoogle(): Promise< Page > {
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
	async clickLoginWithApple(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Continue with Apple")' );
		await locator.click();

		return locator;
	}

	/**
	 * Clicks the "Create an account" link.
	 */
	async clickCreateNewAccount(): Promise< Locator > {
		const locator = this.page.getByRole( 'link', { name: 'Create an account' } );
		await locator.waitFor();
		await locator.click();

		return locator;
	}

	/**
	 * Clicks the "Email me a login link" link.
	 */
	async clickSendMagicLink(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Email me a login link")' );
		await locator.click();

		return locator;
	}

	/**
	 * Clicks the "Lost your password?" link.
	 */
	async clickRetrievePassword(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Lost your password?")' );
		await locator.click();

		return locator;
	}

	/**
	 * Clicks the "Log in with another account" link.
	 *
	 * The link will be shown when visiting the login page as a logged in user.
	 */
	async clickChangeAccount(): Promise< Locator > {
		const locator = await this.page.locator( '#loginAsAnotherUser' );
		await locator.click();

		return locator;
	}

	/**
	 * Clicks the "Sign Up" button in the top-right corner.
	 */
	async clickSignUp(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Sign Up")' );
		await locator.click();

		return locator;
	}
}
