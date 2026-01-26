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
	'Launch site flow: Purchase domain and plan',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const planName = 'Personal';
		let selectedDomain: string;
		let testUser: NewTestUserDetails;
		let newUserDetails: NewUserResponse;
		let newSiteDetails: NewSiteResponse;

		test( 'As a new user, I can create a free site then use launch-site flow to purchase domain and plan', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageLogin,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			testUser = helperData.getNewTestUser();

			await test.step( 'When I navigate to the Login page', async function () {
				BrowserManager.setStoreCookie( page, { currency: 'USD' } );
				await pageLogin.visit();
			} );

			await test.step( 'And I click on button to create a new account', async function () {
				await pageLogin.clickCreateNewAccount();
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I select a .wordpress.com domain name', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( 'And I select WordPress.com Free plan', async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( 'Free', new RegExp( '.*/home/.*' ) );
			} );

			await test.step( 'And I enter the launch-site flow', async function () {
				await page.goto(
					helperData.getCalypsoURL(
						`/start/launch-site?siteSlug=${ newSiteDetails.blog_details.site_slug }`
					)
				);
			} );

			await test.step( 'And I search for a domain', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
			} );

			await test.step( 'And I add the first suggestion to the cart', async function () {
				selectedDomain = await componentDomainSearch.selectFirstSuggestion( false );
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				await pageSignupPickPlan.selectPlanWithoutSiteCreation( planName );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'And I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
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
