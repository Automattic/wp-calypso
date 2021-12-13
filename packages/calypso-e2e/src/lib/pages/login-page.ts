/* eslint-disable require-jsdoc */
import { Locator, Page, Response } from 'playwright';
import { getAccountCredential, getCalypsoURL } from '../../data-helper';

export class LoginPage {
	private page: Page;

	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Opens the login page.
	 *
	 * @see {link https://wordpress.com/log-in}
	 * @returns The main resource response.
	 */
	async visit(): Promise< Response | null > {
		return await this.page.goto( getCalypsoURL( 'log-in' ) );
	}

	async logInWithTestAccount( account: string ): Promise< void > {
		const credentials = getAccountCredential( account );
		await this.logInWithCredentials( ...credentials );
	}

	async logInWithCredentials( username: string, password: string ): Promise< void > {
		await this.fillUsername( username );
		await this.clickSubmit();
		await this.fillPassword( password );
		await Promise.all( [ this.page.waitForNavigation(), this.clickSubmit() ] );
	}

	async fillUsername( value: string ): Promise< Locator > {
		const locator = await this.page.locator( 'input#usernameOrEmail' );
		await locator.fill( value );

		return locator;
	}

	async fillPassword( value: string ): Promise< Locator > {
		const locator = await this.page.locator( 'input#password' );
		await locator.fill( value );

		return locator;
	}

	async fillVerificationCode( value: string ): Promise< Locator > {
		const locator = await this.page.locator( 'input[name="twoStepCode"]' );
		await locator.fill( value );

		return locator;
	}

	async clickSubmit(): Promise< Locator > {
		const locator = await this.page.locator( 'button[type="submit"]' );
		await locator.click();

		return locator;
	}

	async clickLoginWithGoogle(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Continue with Google")' );
		await locator.click();

		return locator;
	}

	async clickLoginWithApple(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Continue with Google")' );
		await locator.click();

		return locator;
	}

	async clickCreateNewAccount(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Create a new account")' );
		await locator.click();

		return locator;
	}

	async clickSendMagicLink(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Email me a login link")' );
		await locator.click();

		return locator;
	}

	async clickRetrievePassword(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Lost your password?")' );
		await locator.click();

		return locator;
	}

	async clickChangeAccount(): Promise< Locator > {
		const locator = await this.page.locator( '#loginAsAnotherUser' );
		await locator.click();

		return locator;
	}

	async clickSignUp(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Sign Up")' );
		await locator.click();

		return locator;
	}
}
