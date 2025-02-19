/**
 * @group calypso-release
 */
import {
	DataHelper,
	ElementHelper,
	UserSignupPage,
	BrowserManager,
	NewUserResponse,
	RestAPIClient,
	DomainSearchComponent,
	EditorPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe( 'Signup: Tailored Start Writing Flow', () => {
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'start_writing',
	} );
	let page: Page;
	let newUserDetails: NewUserResponse;

	beforeAll( async () => {
		page = await browser.newPage();
		await BrowserManager.setStoreCookie( page, { currency: 'EUR' } );
	} );

	it( 'Navigate to /setup/start-writing', async function () {
		await page.goto( DataHelper.getCalypsoURL( '/setup/start-writing' ) );
	} );

	it( 'Sign up with email', async function () {
		const userSignupPage = new UserSignupPage( page );
		newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
	} );

	it( 'Publish first post', async function () {
		const editorPage = new EditorPage( page );
		await editorPage.waitUntilLoaded();
		await editorPage.closeWelcomeGuideIfNeeded();
		await editorPage.enterTitle( 'my first post title' );
		await editorPage.publish();
		await page.getByText( "Your blog's almost ready!" ).waitFor();
	} );

	it( 'Add blog name and description', async function () {
		await page.getByText( 'Name your blog' ).click();

		await page.locator( 'input[name="setup-form-input-name"]' ).fill( 'The Land of Foo' );
		await page
			.locator( 'textarea[name="setup-form-input-description"]' )
			.fill( 'A blog about Foo' );

		await page.locator( 'button.setup-form__submit' ).click();
	} );

	it( 'Ensure domain search is working', async function () {
		await page.getByText( 'Choose a domain' ).click();
		const domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.search( 'test' );
		await page
			.locator( '.domain-search-results' )
			.getByRole( 'button', { name: 'Select' } )
			.first()
			.waitFor();
	} );

	it( 'Skip the domain selection step', async function () {
		await page.getByText( 'Decide later' ).click();
	} );

	it( 'Select WordPress.com Free plan', async function () {
		await page.getByText( 'Choose a plan' ).click();
		// See https://github.com/Automattic/wp-calypso/pull/84468
		await ElementHelper.reloadAndRetry( page, async function () {
			await page.getByRole( 'button', { name: 'Start with Free' } ).click();
		} );
	} );

	it( 'Launch the blog', async function () {
		await page.getByRole( 'button', { name: 'Launch your blog' } ).click();
	} );

	it( 'Ensure "Connect to social" navigates to Marketing page', async function () {
		await page.getByRole( 'button', { name: 'Connect to social' } ).click();
		await page.getByText( 'Marketing and Integrations' ).waitFor();
	} );

	afterAll( async function () {
		if ( ! newUserDetails ) {
			return;
		}

		const restAPIClient = new RestAPIClient(
			{
				username: testUser.username,
				password: testUser.password,
			},
			newUserDetails.body.bearer_token
		);

		await apiCloseAccount( restAPIClient, {
			userID: newUserDetails.body.user_id,
			username: newUserDetails.body.username,
			email: testUser.email,
		} );
	} );
} );
