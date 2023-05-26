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

describe( DataHelper.createSuiteTitle( 'Start Writing Tailored Onboarding' ), () => {
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
			newUserDetails = await userSignupPage.signup(
				testUser.email,
				testUser.username,
				testUser.password
			);
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
			await page.click( '.launchpad__task:nth-child(2) .button' );
			await page.waitForLoadState( 'networkidle' );
			await page.fill(
				'input[name="setup-form-input-name"]',
				`Start writing site ${ testUser.username }`
			);
			await page.fill(
				'textarea[name="setup-form-input-description"]',
				`The place of ${ testUser.username }`
			);
			await page.click( 'button.setup-form__submit' );
		} );

		it( 'Navigate choose a domain', async function () {
			await page.waitForURL( /.*start-writing\/launchpad.*/ );
			await page.click( '.launchpad__task:nth-child(3) .button' );
		} );

		it( 'Search for a domain', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( testUser.username );
		} );

		it( 'Skip selecting a domain', async function () {
			await Promise.all( [ page.waitForNavigation(), page.click( 'text=Decide later' ) ] );
		} );

		it( 'Navigate choose a plan', async function () {
			await page.waitForURL( /.*start-writing\/launchpad.*/ );
			await page.click( '.launchpad__task:nth-child(4) .button' );
		} );

		it( 'Select WordPress.com Free plan', async function () {
			await page.waitForLoadState( 'networkidle' );
			await page.click( 'text="Start with Free"' );
		} );

		it( 'Launch site', async function () {
			await page.waitForURL( /.*start-writing\/launchpad.*/ );
			await page.click( '.launchpad__task:nth-child(5) .button' );
			await page.waitForURL( /.*start-writing\/celebration-step.*/ );
		} );

		it( 'Navigate to connect to social', async function () {
			await page.click( '.celebration-step__top-content-cta-social' );
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
