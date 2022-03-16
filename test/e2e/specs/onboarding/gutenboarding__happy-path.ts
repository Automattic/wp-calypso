/**
 * @group calypso-release
 */

import {
	DataHelper,
	CloseAccountFlow,
	GutenboardingFlow,
	EditorPage,
} from '@automattic/calypso-e2e';
import { Page, Browser, Frame } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Gutenboarding: Create' ), function () {
	const siteTitle = DataHelper.getBlogName();
	const email = DataHelper.getTestEmailAddress( {
		inboxId: DataHelper.config.get( 'signupInboxId' ),
		prefix: `e2eflowtestinggutenboarding${ DataHelper.getTimestamp() }`,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;
	const themeName = 'Twenty Twenty-Two Red';

	let gutenboardingFlow: GutenboardingFlow;
	let page: Page;

	beforeAll( async function () {
		page = await browser.newPage();
	} );

	describe( 'Signup via /new', function () {
		it( 'Navigate to /new', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'new' ) );
		} );

		it( 'Enter new site name', async function () {
			gutenboardingFlow = new GutenboardingFlow( page );
			await gutenboardingFlow.enterSiteTitle( siteTitle );
			await gutenboardingFlow.clickButton( 'Continue' );
		} );

		it( 'Search for and select a WordPress.com domain name', async function () {
			await gutenboardingFlow.searchDomain( siteTitle );
			await gutenboardingFlow.selectDomain( siteTitle.concat( '.wordpress.com' ) );
			await gutenboardingFlow.clickButton( 'Continue' );
		} );

		it( `Select ${ themeName } as the site design`, async function () {
			await gutenboardingFlow.selectDesign( themeName );
		} );

		it( 'Select to add the Plugin feature', async function () {
			await gutenboardingFlow.selectFeatures( [ 'Plugins' ] );
			await gutenboardingFlow.clickButton( 'Continue' );
		} );

		it( 'WordPress.com Business plan is recommended', async function () {
			await gutenboardingFlow.validateRecommendedPlan( 'Business' );
		} );

		it( 'Select free plan', async function () {
			await gutenboardingFlow.selectPlan( 'Free' );
		} );

		it( 'Create account', async function () {
			await Promise.all( [
				page.waitForNavigation( { waitUntil: 'networkidle' } ),
				gutenboardingFlow.signup( email, signupPassword ),
			] );
		} );

		it( 'Navigated to Site Editor', async function () {
			await page.waitForURL( /.*\/site-editor\/.*/, { waitUntil: 'networkidle' } );

			// {@TODO} This is temporary while the FSE spec is awaiting migration to Playwright.
			const editorPage = new EditorPage( page );
			await editorPage.forceDismissWelcomeTour();
			const outerFrame = await editorPage.getEditorFrame();

			// There's another iframe within the parent iframe.
			const innerFrame = ( await (
				await outerFrame.waitForSelector( 'iframe[name="editor-canvas"]' )
			 ).contentFrame() ) as Frame;
			await innerFrame.waitForSelector( '[aria-label="Block: Site Title"]' );
			const elementHandle = await innerFrame.waitForSelector( '[aria-label="Block: Site Title"]' );
			const siteEditorTitle = await elementHandle.innerText();
			expect( siteEditorTitle ).toStrictEqual( siteTitle );
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Navigate to Home dashboard', async function () {
			// When you go to the home dashboard, there is a delayed redirect to '**/home/<sitename>'.
			// That delayed redirect can disrupt following actions in a race condition, so we must wait for that redirect to finish!
			await Promise.all( [
				page.waitForNavigation( { url: '**/home/**' } ),
				page.goto( DataHelper.getCalypsoURL( 'home' ) ),
			] );
		} );

		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
