import { DataHelper, LoginFlow } from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Social Login' ), function () {
	describe.skip( 'Google', function () {
		let popupPage;

		it( 'Click to continue with Google', async function () {
			const loginFlow = new LoginFlow( this.page );
			popupPage = await loginFlow.initiateSocialLogin( 'Google' );
		} );

		it( 'Google login page references WordPress', async function () {
			await popupPage.waitForSelector( 'text=/[C|c]ontinue to WordPress/i' );
		} );

		it( 'Close popup', async function () {
			await popupPage.close();
		} );
	} );

	describe.skip( 'Apple', function () {
		it( 'Click to continue with Apple', async function () {
			const loginFlow = new LoginFlow( this.page );
			await loginFlow.initiateSocialLogin( 'Apple' );
		} );

		it( 'Apple login page references WordPress', async function () {
			await this.page.waitForSelector( 'text=Use your Apple ID to sign in to WordPress.' );
		} );
	} );
} );
