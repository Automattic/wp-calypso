/**
 * @group calypso-release
 */
import {
	DataHelper,
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
	let domainSearchComponent: DomainSearchComponent;
	let newUserDetails: NewUserResponse;

	beforeAll( async () => {
		page = await browser.newPage();
		await BrowserManager.setStoreCookie( page, { currency: 'EUR' } );
	} );

	describe( 'Signup via /setup/start-writing', function () {
		let editorPage: EditorPage;
		const postTitle = 'my first post title';

		it( 'Navigate to /setup/start-writing', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/setup/start-writing' ) );
		} );

		it( 'Enter account details', async function () {
			await page.waitForURL( /.*start-writing.*/ );
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
		} );

		it( "Start user's first post", async function () {
			await page.waitForURL( /.*post-new.php\?start-writing=true.*/ );
			editorPage = new EditorPage( page );
		} );

		it( 'Enter blog title', async function () {
			await editorPage.enterTitle( postTitle );
		} );

		it( 'Publish post and open Launchpad', async function () {
			await editorPage.publish();
			await page.waitForURL( /.*start-writing\/launchpad.*/ );
			await page.locator( ':text("Your blog\'s almost ready!")' ).waitFor();
		} );

		it( 'Add blog name and description', async function () {
			await page.getByRole( 'button', { name: 'Name your blog' } ).click();
			await page.getByPlaceholder( 'A catchy name to make your blog memorable' );

			await page
				.locator( 'input[name="setup-form-input-name"]' )
				.fill( `Start writing site ${ testUser.username }` );
			await page
				.locator( 'textarea[name="setup-form-input-description"]' )
				.fill( `The place of ${ testUser.username }` );

			await page.locator( 'button.setup-form__submit' ).click();
		} );

		it( 'Navigate choose a domain', async function () {
			await page.waitForURL( /.*start-writing\/launchpad.*/ );
			await page.getByRole( 'button', { name: 'Choose a domain' } ).click();
		} );

		it( 'Search for a domain', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( testUser.username );
		} );

		it( 'Skip selecting a domain', async function () {
			await Promise.all( [
				page.waitForURL( /.*start-writing\/domains.*/ ),
				page.click( 'text=Decide later' ),
			] );
		} );

		it( 'Navigate choose a plan', async function () {
			await page.waitForURL( /.*start-writing\/launchpad.*/ );
			await page.getByRole( 'button', { name: 'Choose a plan' } ).click();
		} );

		it( 'Select WordPress.com Free plan', async function () {
			await page.getByRole( 'button', { name: 'Start with Free' } ).click( { timeout: 60_000 } );
		} );

		it( 'Launch site', async function () {
			await page.waitForURL( /.*start-writing\/launchpad.*/ );
			await page.getByRole( 'button', { name: 'Launch your blog' } ).click();
		} );

		it( "Ensure we're redirected to celebration screen", async function () {
			await page.waitForURL( /.*start-writing\/celebration-step.*/ );
		} );

		it( 'Navigate to connect to social', async function () {
			await page.waitForURL( /.*start-writing\/celebration-step.*/ );
			await page.getByRole( 'button', { name: 'Connect to social' } ).click();
			await page.waitForURL( /.*marketing\/connections.*/ );
		} );
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
