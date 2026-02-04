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
	'Launch Site Flows',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const accountsToCleanup: {
			testUser: NewTestUserDetails;
			newUserDetails: NewUserResponse;
			newSiteDetails?: NewSiteResponse;
		}[] = [];

		test( 'As a new user, I can create a free site then use launch-site flow to purchase domain and plan', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageLogin,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			const testUser = helperData.getNewTestUser();
			const planName = 'Personal';
			let selectedDomain: string;
			let newUserDetails: NewUserResponse;
			let newSiteDetails: NewSiteResponse;

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
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
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

		test( 'As a new user, I can create a free site then use launch-site flow to purchase a plan only', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageLogin,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			const testUser = helperData.getNewTestUser();
			const planName = 'Personal';
			let newUserDetails: NewUserResponse;
			let newSiteDetails: NewSiteResponse;

			await test.step( 'When I navigate to the Login page', async function () {
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
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
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

			await test.step( 'And I skip domain selection', async function () {
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				await pageSignupPickPlan.selectPlanWithoutSiteCreation( planName );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );
		} );

		test.afterAll( 'Delete all user accounts generated', async function () {
			for ( const account of accountsToCleanup ) {
				const restAPIClient = new RestAPIClient(
					{
						username: account.testUser.username,
						password: account.testUser.password,
					},
					account.newUserDetails.body.bearer_token
				);

				if ( account.newSiteDetails ) {
					await apiDeleteSite( restAPIClient, {
						url: account.newSiteDetails.blog_details.url,
						id: account.newSiteDetails.blog_details.blogid,
						name: account.newSiteDetails.blog_details.blogname,
					} );
				}

				await apiCloseAccount( restAPIClient, {
					userID: account.newUserDetails.body.user_id,
					username: account.newUserDetails.body.username,
					email: account.testUser.email,
				} );
			}
		} );
	}
);
