import {
	BrowserManager,
	DataHelper,
	EditorPage,
	MyHomePage,
	NewSiteResponse,
	RestAPIClient,
	SignupDomainPage,
	SignupPickPlanPage,
	StartSiteFlow,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiDeleteSite } from '../shared';

// We might want to re-enable this test for CIAB, so leaving here until EOY.
test.describe(
	DataHelper.createSuiteTitle( 'Plugins: Browse' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		let newSiteDetails: NewSiteResponse;
		let siteCreatedFlag = false;
		let testAccount: TestAccount;

		test.skip( true, 'Entire suite is skipped pending re-evaluation (was describe.skip in Jest)' );

		test.afterAll( async () => {
			if ( ! siteCreatedFlag ) {
				return;
			}
			const restAPIClient = new RestAPIClient( {
				username: testAccount.credentials.username,
				password: testAccount.credentials.password,
			} );
			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		} );

		test( 'Focused Launchpad: log in, select goal and theme, launch site', async ( { page } ) => {
			const themeName = 'Retrospect';
			let startSiteFlow: StartSiteFlow;
			let editorPage: EditorPage;

			await test.step( 'Setup: authenticate', async () => {
				const testUser = getTestAccountByFeature( envToFeatureKey( envVariables ), [
					{
						gutenberg: 'stable',
						siteType: 'simple',
						accountName: 'defaultUser',
					},
				] );
				testAccount = new TestAccount( testUser );
				await testAccount.authenticate( page );
			} );

			// Log in, select a goal and theme
			await test.step( 'Set store cookie and create StartSiteFlow', async () => {
				await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
				startSiteFlow = new StartSiteFlow( page );
			} );

			await test.step( 'Visit onboarding page', async () => {
				await page.goto( DataHelper.getCalypsoURL( '/setup/onboarding' ) );
			} );

			await test.step( 'Skip domain selection', async () => {
				const signupDomainPage = new SignupDomainPage( page );
				await signupDomainPage.searchForFooDomains();
				await signupDomainPage.skipDomainSelection();
			} );

			await test.step( 'Select WordPress.com Free plan', async () => {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				newSiteDetails = await signupPickPlanPage.selectPlan( 'Free' );
				siteCreatedFlag = true;
			} );

			await test.step( 'Select "Publish a blog" goal', async () => {
				await startSiteFlow.selectGoal( 'Publish a blog' );
				await startSiteFlow.clickButton( 'Next' );
			} );

			await test.step( 'Select theme', async () => {
				await startSiteFlow.selectTheme( themeName );
				await startSiteFlow.clickButton( 'Continue' );
			} );

			// Launch the site
			await test.step( 'Visit Focused Launchpad page', async () => {
				const title = page.getByText( "Let's get started!" );
				await title.waitFor( { timeout: 30 * 1000 } );
			} );

			await test.step( 'Start building your audience', async () => {
				const addSubscribersButton = page.getByText( 'Start building your audience' );
				await addSubscribersButton.waitFor();
				await addSubscribersButton.click();
				await new Promise( ( r ) => setTimeout( r, 1000 ) );
				await page.goto(
					DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
				);
			} );

			await test.step( 'Complete your profile', async () => {
				const completeProfileButton = page.getByText( 'Complete your profile' );
				await completeProfileButton.waitFor();
				await completeProfileButton.click();
				await new Promise( ( r ) => setTimeout( r, 1000 ) );
				await page.goto(
					DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
				);
			} );

			await test.step( 'Give your site a name', async () => {
				const giveSiteNameButton = page.getByText( 'Give your site a name' );
				await giveSiteNameButton.waitFor();
				await giveSiteNameButton.click();
			} );

			await test.step( 'Once at the /wp-admin settings page, update site name', async () => {
				await page.fill( 'input[name="blogname"]', DataHelper.getRandomPhrase() );
				const saveChangesButton = page.getByRole( 'button', { name: 'Save Changes' } );
				await saveChangesButton.click();
				// The first time we save, we need to wait for the page to reload because it redirects to Calypso's settings page
				// before loading /wp-admin settings page again, so we'd lose the settings updated notice
				await new Promise( ( r ) => setTimeout( r, 5000 ) );
				await saveChangesButton.click();
				await page.waitForSelector( '#setting-error-settings_updated' );
				await page.goto(
					DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
				);
			} );

			await test.step( "It will write the user's first post", async () => {
				const writeFirstPostButton = page.getByText( 'Write your first post' );
				await writeFirstPostButton.waitFor( { timeout: 30 * 1000 } );
				await writeFirstPostButton.click();
			} );

			await test.step( 'Editor loads', async () => {
				editorPage = new EditorPage( page );
				await editorPage.waitUntilLoaded();
				await new Promise( ( r ) => setTimeout( r, 2000 ) );
				await editorPage.closeWelcomeGuideIfNeeded();
			} );

			await test.step( 'Enter blog title', async () => {
				await editorPage.enterTitle( DataHelper.getRandomPhrase() );
			} );

			await test.step( 'Publish post', async () => {
				await editorPage.publish();
				await page.goto(
					DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
				);
			} );

			await test.step( 'Should show Launch Site button and update title', async () => {
				const header = page.getByText( "You're all set!" );
				await header.waitFor();
				const launchSiteButton = page.getByText( 'Launch your site' );
				await launchSiteButton.waitFor();
				await launchSiteButton.click();
			} );

			await test.step( 'Make sure launch modal shows', async () => {
				const myHomePage = new MyHomePage( page );
				await myHomePage.validateTaskHeadingMessage( 'Congrats, your site is live!' );
			} );
		} );
	}
);
