import {
	BrowserManager,
	CartCheckoutPage,
	DataHelper,
	NewUserResponse,
	PlansPage,
	PurchasesPage,
	RestAPIClient,
	SnackbarComponent,
	UserSignupPage,
	cancelAtomicPurchaseFlow,
	cancelSubscriptionFlow,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCancelAtomicPlan, apiCloseAccount } from '../shared';

test.describe(
	DataHelper.createSuiteTitle( 'New Hosted Site Flow: Purchase a hosted site and cancel it' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const planName = 'Business';
		const testUser = DataHelper.getNewTestUser();
		let newUserDetails: NewUserResponse | undefined;
		let siteSlug: string;

		test.afterAll( async () => {
			if ( ! newUserDetails ) {
				return;
			}
			// An account with an active Atomic site cannot be closed ("atomic-site").
			// The Atomic site cannot be deleted via API either ("cannot delete jetpack
			// site via API"), so the only lever is cancelling the Business plan, which
			// deprovisions the site asynchronously. The in-test cancellation only runs
			// on the happy path; cancel here too (bearer-scoped) so a mid-test failure
			// still deprovisions. apiCloseAccount then polls the close past that wait.
			test.setTimeout( 300 * 1000 );

			const restAPIClient = new RestAPIClient(
				{ username: testUser.username, password: testUser.password },
				newUserDetails.body.bearer_token
			);

			await apiCancelAtomicPlan( restAPIClient );

			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );

		test( 'As a new user, I can purchase a hosted site and cancel it', async ( { page } ) => {
			// ~360s of dominant waits (90s purchase + 180s Atomic transfer + 30s
			// checkout + two 30s refund notices) plus signup, billing and two
			// cancellation navigations; 420s covers the worst case.
			test.setTimeout( 420 * 1000 );

			let cartCheckoutPage: CartCheckoutPage;

			await test.step( 'Given the store currency is set to GBP', async () => {
				await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
			} );

			await test.step( 'When I enter the new-hosted-site flow', async () => {
				const flowUrl = DataHelper.getCalypsoURL( '/setup/new-hosted-site' );
				await page.goto( flowUrl );
			} );

			await test.step( 'When I sign up as a new user', async () => {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( `When I pick the 50 GB storage add-on for the ${ planName } plan`, async () => {
				const plansPage = new PlansPage( page );
				await plansPage.selectAddOn( planName, '50 GB' );
			} );

			await test.step( `When I pick the ${ planName } plan`, async () => {
				const plansPage = new PlansPage( page );
				await Promise.all( [
					plansPage.selectPlan( planName ),
					page.waitForURL( /.*\/checkout\/.*/, { timeout: 30 * 1000 } ),
				] );
			} );

			await test.step( 'Then I see plan and storage add-on at checkout', async () => {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
				await cartCheckoutPage.validateCartItem( 'Storage Add-On' );
			} );

			await test.step( 'When I enter billing and payment details', async () => {
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await cartCheckoutPage!.enterBillingDetails( paymentDetails );
				await cartCheckoutPage!.enterPaymentDetails( paymentDetails );
			} );

			await test.step( 'When I make purchase', async () => {
				await cartCheckoutPage!.purchase( { timeout: 90 * 1000 } );
			} );

			await test.step( 'Then I wait for the Atomic transfer to complete', async () => {
				await page.waitForURL( /.*transferring-hosted-site.*/ );

				// The flow exits to wp-admin when the site's admin-interface option says
				// so, and to the dashboard's site overview otherwise. Which one wins is
				// a race on that option being loaded, so accept either: this test cares
				// about the purchases that follow, not where the transfer lands.
				await page.waitForURL( /wp-admin|\/sites\/[^/?#]+/, { timeout: 180 * 1000 } );
			} );

			await test.step( 'Then I capture the slug of the transferred site', async () => {
				// wp-admin: https://<slug>/wp-admin/
				// Site overview: https://my.wordpress.com/sites/<slug>
				const url = new URL( page.url() );
				siteSlug = url.pathname.startsWith( '/sites/' )
					? ( url.pathname.split( '/' ).pop() as string )
					: url.hostname;
			} );

			await test.step( 'When I navigate to the purchases page to cancel the add-on', async () => {
				const purchasesPage = new PurchasesPage( page );
				await purchasesPage.visit();
			} );

			await test.step( 'When I cancel storage add-on', async () => {
				const purchasesPage = new PurchasesPage( page );
				await purchasesPage.clickOnPurchase( 'Storage Add-On Space Upgrade 50 GB', siteSlug! );
				await purchasesPage.cancelPurchase();
				await cancelSubscriptionFlow( page );
				const snackbarComponent = new SnackbarComponent( page );
				await snackbarComponent.snackbarShown(
					'Your refund has been processed and your purchase removed.',
					{ timeout: 30 * 1000 }
				);
			} );

			await test.step( 'When I navigate to the purchases page to cancel the plan', async () => {
				const purchasesPage = new PurchasesPage( page );
				await purchasesPage.visit();
			} );

			await test.step( 'When I cancel plan', async () => {
				const purchasesPage = new PurchasesPage( page );
				await purchasesPage.clickOnPurchase( `WordPress.com ${ planName }`, siteSlug! );
				await purchasesPage.cancelPurchase();
				await cancelAtomicPurchaseFlow( page, {
					reason: 'Another reason…',
					customReasonText: 'E2E TEST CANCELLATION',
				} );
				const snackbarComponent = new SnackbarComponent( page );
				await snackbarComponent.snackbarShown(
					'Your refund has been processed and your purchase removed.',
					{ timeout: 30 * 1000 }
				);
			} );
		} );
	}
);
