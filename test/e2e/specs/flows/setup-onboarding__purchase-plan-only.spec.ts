import {
	BrowserManager,
	NewTestUserDetails,
	NewUserResponse,
	NewSiteResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount, apiDeleteSite } from '../shared';

test.describe(
	'Onboarding flow: Purchase a plan without a custom domain',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const planName = 'Personal';
		let testUser: NewTestUserDetails;
		let newUserDetails: NewUserResponse;
		let newSiteDetails: NewSiteResponse;

		test( 'As a new user, I can complete the onboarding flow and purchase a plan without a custom domain', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			testUser = helperData.getNewTestUser();

			await test.step( 'When I enter the onboarding flow', async function () {
				BrowserManager.setStoreCookie( page, { currency: 'USD' } );
				await page.goto( helperData.getCalypsoURL( '/setup/onboarding' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I skip domain purchase', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'And I see only one item in the cart', async function () {
				await pageCartCheckout.validateCartItemsCount( 1 );
			} );
		} );

		test.afterEach( 'Delete site and user accounts generated', async function () {
			if ( newUserDetails && testUser ) {
				const restAPIClient = new RestAPIClient(
					{
						username: testUser.username,
						password: testUser.password,
					},
					newUserDetails.body.bearer_token
				);

				if ( newSiteDetails ) {
					await apiDeleteSite( restAPIClient, {
						url: newSiteDetails.blog_details.url,
						id: newSiteDetails.blog_details.blogid,
						name: newSiteDetails.blog_details.blogname,
					} );
				}

				await apiCloseAccount( restAPIClient, {
					userID: newUserDetails.body.user_id,
					username: newUserDetails.body.username,
					email: testUser.email,
				} );
			}
		} );
	}
);
