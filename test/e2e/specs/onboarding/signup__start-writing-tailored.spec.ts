import { NewUserResponse } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Signup: Tailored Start Writing Flow',
	{
		tag: [ tags.CALYPSO_RELEASE ],
		annotation: { type: 'flowchart', description: 'TBA' },
	},
	() => {
		test( 'One: As a new WordPress.com blogger I can sign up for a new free site and start writing straight away', async ( {
			page,
			helperData,
			pageUserSignUp,
			pageEditor,
		} ) => {
			const testUser = helperData.getNewTestUser( {
				usernamePrefix: 'start_writing',
			} );
			let newUserDetails: NewUserResponse;

			await test.step( 'When I visit the /setup/start-writing page', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup/start-writing' ) );
			} );

			await test.step( 'Then I see the Create your account page', async function () {
				await expect( pageUserSignUp.createYourAccountHeading ).toBeVisible();
			} );

			await test.step( 'When I sign up with my email', async function () {
				newUserDetails = await pageUserSignUp.signupWithEmail( testUser.email );
				console.log( newUserDetails );
			} );

			await test.step( 'And I am taken to the editor and publish my first post', async function () {
				await pageEditor.waitUntilLoaded();
				await pageEditor.closeWelcomeGuideIfNeeded();
				await pageEditor.enterTitle( helperData.getRandomPhrase() );
				await pageEditor.publish();
				await page.getByText( "Your blog's almost ready!" ).waitFor();
			} );
		} );
	}
);

// /**
//  * @group calypso-release
//  */
// import {
// 	DataHelper,
// 	ElementHelper,
// 	UserSignupPage,
// 	BrowserManager,
// 	NewUserResponse,
// 	RestAPIClient,
// 	EditorPage,
// 	DomainSearchComponent,
// } from '@automattic/calypso-e2e';
// import { Page, Browser } from 'playwright';
// import { apiCloseAccount } from '../shared';

// declare const browser: Browser;

// describe( 'Signup: Tailored Start Writing Flow', () => {
// 	const testUser = DataHelper.getNewTestUser( {
// 		usernamePrefix: 'start_writing',
// 	} );
// 	let page: Page;
// 	let newUserDetails: NewUserResponse;

// 	beforeAll( async () => {
// 		page = await browser.newPage();
// 		await BrowserManager.setStoreCookie( page, { currency: 'EUR' } );
// 	} );

// 	it( 'Navigate to /setup/start-writing', async function () {
// 		await page.goto( DataHelper.getCalypsoURL( '/setup/start-writing' ) );
// 	} );

// 	it( 'Sign up with email', async function () {
// 		const userSignupPage = new UserSignupPage( page );
// 		newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
// 	} );

// 	it( 'Publish first post', async function () {
// 		const editorPage = new EditorPage( page );
// 		await editorPage.waitUntilLoaded();
// 		await editorPage.closeWelcomeGuideIfNeeded();
// 		await editorPage.enterTitle( DataHelper.getRandomPhrase() );
// 		await editorPage.publish();
// 		await page.getByText( "Your blog's almost ready!" ).waitFor();
// 	} );

// 	it( 'Add blog name and description', async function () {
// 		await page.getByRole( 'link', { name: 'Select to name your blog' } ).click();

// 		await page.locator( 'input[name="setup-form-input-name"]' ).fill( 'The Land of Foo' );
// 		await page
// 			.locator( 'textarea[name="setup-form-input-description"]' )
// 			.fill( 'A blog about Foo' );

// 		await page.locator( 'button.setup-form__submit' ).click();
// 	} );

// 	it( 'Ensure domain search is working', async function () {
// 		await page.getByRole( 'link', { name: 'Select to choose a domain' } ).click();
// 		const domainSearchComponent = new DomainSearchComponent( page );
// 		await domainSearchComponent.search( 'test' );
// 	} );

// 	it( 'Skip the domain selection step', async function () {
// 		const domainSearchComponent = new DomainSearchComponent( page );
// 		await domainSearchComponent.skipPurchase();
// 	} );

// 	it( 'Select WordPress.com Free plan', async function () {
// 		await page.getByRole( 'link', { name: 'Select to choose a plan' } ).click();
// 		// See https://github.com/Automattic/wp-calypso/pull/84468
// 		await ElementHelper.reloadAndRetry( page, async function () {
// 			await page.getByRole( 'button', { name: 'Start with Free' } ).click();
// 		} );
// 	} );

// 	it( 'Launch the blog', async function () {
// 		await page.getByRole( 'button', { name: 'Launch your blog' } ).click();
// 	} );

// 	it( 'Ensure "Connect to social" navigates to Jetpack Social', async function () {
// 		await page.getByRole( 'button', { name: 'Connect to social' } ).click();
// 		await page.getByText( 'Write once, post everywhere' ).waitFor();
// 	} );

// 	afterAll( async function () {
// 		if ( ! newUserDetails ) {
// 			return;
// 		}

// 		const restAPIClient = new RestAPIClient(
// 			{
// 				username: testUser.username,
// 				password: testUser.password,
// 			},
// 			newUserDetails.body.bearer_token
// 		);

// 		await apiCloseAccount( restAPIClient, {
// 			userID: newUserDetails.body.user_id,
// 			username: newUserDetails.body.username,
// 			email: testUser.email,
// 		} );
// 	} );
// } );
