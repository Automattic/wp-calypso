import {
	CartCheckoutPage,
	DataHelper,
	DomainSearchComponent,
	NewUserResponse,
	PlansPage,
	RestAPIClient,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

/**
 * Verifies the logged-out Plugins marketplace "Get started" signup flow shows the paid plans
 * grid (with the free plan hidden) and keeps the selected plugin in the cart — instead of
 * forcing the Business plan / skipping the grid.
 *
 * Keywords: Plugins, Marketplace, Signup, Get started, Plan, Checkout
 */
test.describe(
	'Plugins: "Get started" shows the paid plans grid',
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const planName = 'Personal';
		// A paid marketplace plugin, so the flow carries a plugin product into the cart.
		const pluginSlug = 'sensei-pro';
		const pluginName = 'Sensei Pro';

		const testUser = DataHelper.getNewTestUser( { usernamePrefix: 'pluginlp' } );
		let newUserDetails: NewUserResponse | undefined;

		test.afterAll( async () => {
			if ( ! newUserDetails ) {
				return;
			}
			const restAPIClient = new RestAPIClient(
				{ username: testUser.username, password: testUser.password },
				newUserDetails.body.bearer_token
			);
			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );

		test( 'As a logged-out user, plugin "Get started" leads to the paid plans grid', async ( {
			page,
		} ) => {
			// Signup + site creation dominate the runtime; the 120s default isn't enough.
			test.setTimeout( 180 * 1000 );

			await test.step( 'When I open the with-plugin flow from a plugin "Get started" CTA', async () => {
				// The URL the logged-out per-plugin "Get started" CTA builds
				// (client/my-sites/plugins/plugin-details-CTA/index.jsx).
				await page.goto(
					DataHelper.getCalypsoURL( 'start/with-plugin', {
						plugin: pluginSlug,
						ref: 'plugins-lp',
						billing_period: 'ANNUALLY',
					} )
				);
			} );

			await test.step( 'When I sign up as a new user', async () => {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'When I choose a free domain', async () => {
				const domainSearch = new DomainSearchComponent( page );
				await domainSearch.search( testUser.siteName );
				await domainSearch.skipPurchase();
			} );

			await test.step( 'Then the plans step hides the free plan and shows paid plans', async () => {
				// Plugins require a paid plan, so no free-plan action button is offered.
				await expect( page.getByRole( 'button', { name: /free/i } ) ).toHaveCount( 0 );
				// Paid plans are shown (the plan button renders once per grid view, so scope to
				// the first, matching how PlansPage.selectPlan handles the duplicate).
				await expect(
					page.getByRole( 'button', { name: 'Get Personal plan' } ).first()
				).toBeVisible();
			} );

			await test.step( `When I select the ${ planName } plan`, async () => {
				const plansPage = new PlansPage( page );
				await plansPage.selectPlan( planName );
			} );

			await test.step( `Then checkout contains the ${ planName } plan and the plugin`, async () => {
				const cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
				await cartCheckoutPage.validateCartItem( pluginName );
			} );
		} );
	}
);
