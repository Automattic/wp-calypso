import {
	BrowserManager,
	SignupPickPlanPage,
	RestAPIClient,
	CartCheckoutPage,
	DomainSearchComponent,
	NewSiteResponse,
	TestAccount,
} from '@automattic/calypso-e2e';
import { test, expect, tags } from '../../lib/pw-base';
import { apiDeleteSite } from '../shared';

// spec converted from: plans__signup-business.ts

test.describe(
	'Plans: Create a WordPress.com/Business site as existing user',
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const planName = 'Business';
		let siteCreatedFlag = false;
		let newSiteDetails: NewSiteResponse | undefined;
		let accountUsed: TestAccount;

		test( 'Create, purchase, and validate Business plan as existing user', async ( {
			page,
			accountPreRelease,
			helperData,
			componentSidebar,
		} ) => {
			await test.step( 'Authenticate as existing user', async () => {
				await accountPreRelease.authenticate( page );
				accountUsed = accountPreRelease;
			} );

			await test.step( 'Prepare store cookie', async () => {
				await BrowserManager.setStoreCookie( page );
			} );

			await test.step( 'Navigate to /start', async () => {
				await page.goto( helperData.getCalypsoURL( 'start' ) );
			} );

			await test.step( 'Skip domain selection', async () => {
				const signupDomainPage = new DomainSearchComponent( page );
				await signupDomainPage.search( 'foo' );
				await signupDomainPage.skipPurchase();
			} );

			await test.step( `Select WordPress.com ${ planName } plan`, async () => {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				newSiteDetails = await signupPickPlanPage.selectPlan( planName );
				siteCreatedFlag = true;
			} );

			await test.step( 'See secure checkout', async () => {
				const cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'Enter payment details', async () => {
				const cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.selectSavedCard( 'End to End Testing' );
			} );

			await test.step( 'Make purchase', async () => {
				const cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.purchase( { timeout: 75 * 1000 } );
			} );

			await test.step( 'See Home', async () => {
				await page.waitForURL( /home/ );
			} );

			await test.step( `Sidebar shows WordPress.com ${ planName } plan`, async () => {
				const currentPlan = await componentSidebar.getCurrentPlanName();
				expect( currentPlan ).toBe( planName );
			} );
		} );

		test.afterAll( 'Delete site generated', async function () {
			if ( siteCreatedFlag && newSiteDetails ) {
				const restAPIClient = new RestAPIClient( {
					username: accountUsed.credentials.username,
					password: accountUsed.credentials.password,
				} );

				await apiDeleteSite( restAPIClient, {
					url: newSiteDetails.blog_details.url,
					id: newSiteDetails.blog_details.blogid,
					name: newSiteDetails.blog_details.blogname,
				} );
			}
		} );
	}
);
