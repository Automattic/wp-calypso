/**
 * @group calypso-release
 */

import {
	DataHelper,
	StartSiteFlow,
	RestAPIClient,
	SecretsManager,
	DomainSearchComponent,
	SignupPickPlanPage,
	NewSiteResponse,
	TestAccount,
	EditorPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'FTME: Write' ), function () {
	const blogName = DataHelper.getBlogName();
	const blogTagLine = `${ blogName } tagline`;

	let siteCreatedFlag: boolean;
	let newSiteDetails: NewSiteResponse;
	let page: Page;
	let selectedFreeDomain: string;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Create site', function () {
		it( 'Navigate to /new', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'start' ) );
		} );

		it( 'Select a .wordpress.com domain name', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( blogName );
			selectedFreeDomain = await domainSearchComponent.selectDomain( '.wordpress.com' );
		} );

		it( `Select WordPress.com Free plan`, async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page, selectedFreeDomain );
			newSiteDetails = await signupPickPlanPage.selectPlan( 'Free' );

			siteCreatedFlag = true;
		} );
	} );

	describe( 'Onboarding', function () {
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Enter Onboarding flow for the selected domain', async function () {
			await expect(
				page.waitForURL( /setup\/site-setup\/goals\?/, { timeout: 30 * 1000 } )
			).resolves.not.toThrow();

			const urlRegex = `/setup/site-setup/goals?siteSlug=${ selectedFreeDomain }`;
			expect( page.url() ).toMatch( urlRegex );
		} );

		it( 'Select "Write" goal', async function () {
			await startSiteFlow.selectGoal( 'Write' );
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Enter blog name', async function () {
			await startSiteFlow.enterBlogName( blogName );
		} );

		it( 'Enter blog tagline', async function () {
			await startSiteFlow.enterTagline( blogTagLine );
			await startSiteFlow.clickButton( 'Continue' );
		} );
	} );

	describe( 'Write', function () {
		const postTitle = DataHelper.getRandomPhrase();

		let startSiteFlow: StartSiteFlow;
		let editorPage: EditorPage;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Write first post', async function () {
			await Promise.all( [
				page.waitForNavigation(),
				startSiteFlow.clickButton( 'Start writing' ),
			] );
		} );

		it( 'Editor loads', async function () {
			editorPage = new EditorPage( page );
			await editorPage.waitUntilLoaded();

			const urlRegex = `/post/${ newSiteDetails.blog_details.site_slug }`;
			expect( page.url() ).toMatch( urlRegex );
		} );

		it( 'Enter blog title', async function () {
			await editorPage.enterTitle( postTitle );
		} );

		it( 'Publish post', async function () {
			await editorPage.publish();
		} );

		it( 'First post congratulatory message is shown', async function () {
			const editorParent = await editorPage.getEditorParent();

			await editorParent.locator( ':text("Your first post is published!")' ).waitFor();
			await page.keyboard.press( 'Escape' );
		} );

		it( 'Dismiss Launchpad modal if shown', async function () {
			const editorParent = await editorPage.getEditorParent();

			const selector = '.launchpad__save-modal-buttons button';
			const locator = editorParent.locator( selector );
			try {
				await locator.click( { timeout: 2000 } );
			} catch {
				// 	// noop;
			}
		} );

		it( 'Exit editor', async function () {
			await editorPage.exitEditor();
		} );
	} );

	afterAll( async function () {
		if ( ! siteCreatedFlag ) {
			return;
		}

		const restAPIClient = new RestAPIClient(
			SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser
		);

		await apiDeleteSite( restAPIClient, {
			url: newSiteDetails.blog_details.url,
			id: newSiteDetails.blog_details.blogid,
			name: newSiteDetails.blog_details.blogname,
		} );
	} );
} );
