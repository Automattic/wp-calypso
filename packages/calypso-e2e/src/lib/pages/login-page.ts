/* eslint-disable require-jsdoc */
import { Locator, Page, Response } from 'playwright';

export class LoginPage {
	private page: Page;

	constructor( page: Page ) {
		this.page = page;
	}

	async clickSignUp(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Sign Up")' );
		await locator.click();

		return locator;
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

	async clickContinue(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Continue")' );
		await locator.click();

		return locator;
	}

	async clickContinueWithGoogle(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Continue with Google")' );
		await locator.click();

		return locator;
	}

	async clickContinueWithApple(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Continue with Google")' );
		await locator.click();

		return locator;
	}

	async clickCreateANewAccount(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Create a new account")' );
		await locator.click();

		return locator;
	}

	async clickEmailMeALoginLink(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Email me a login link")' );
		await locator.click();

		return locator;
	}

	async clickLostYourPassword(): Promise< Locator > {
		const locator = await this.page.locator( ':text-is("Lost your password?")' );
		await locator.click();

		return locator;
	}

	async clickLogInAsAnotherUser(): Promise< Locator > {
		const locator = await this.page.locator( '#loginAsAnotherUser' );
		await locator.click();

		return locator;
	}

	async waitForLoginResponse(): Promise< Response > {
		return await this.page.waitForResponse( '**/wp-login.php?action=login-endpoint' );
	}
}
