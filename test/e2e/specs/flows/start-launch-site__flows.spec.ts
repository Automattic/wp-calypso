import {
	BrowserManager,
	NewTestUserDetails,
	NewUserResponse,
	NewSiteResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount, apiCreateUnlaunchedFreeSiteForUser, apiDeleteSite } from '../shared';

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

		test( 'As a new user with a free site, I can use launch-site flow to purchase domain and plan', async ( {
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

			await test.step( 'Given I have an unlaunched free site', async function () {
				newSiteDetails = await apiCreateUnlaunchedFreeSiteForUser(
					testUser,
					newUserDetails,
					helperData.getBlogName()
				);
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

		test( 'As a new user with a free site, I can use launch-site flow to purchase a plan only', async ( {
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

			await test.step( 'Given I have an unlaunched free site', async function () {
				newSiteDetails = await apiCreateUnlaunchedFreeSiteForUser(
					testUser,
					newUserDetails,
					helperData.getBlogName()
				);
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

		test( 'As a new user with a free site, I can launch it without purchasing a domain or a plan', async ( {
			page,
			componentDomainSearch,
			componentLaunchCelebration,
			helperData,
			pageLogin,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			const testUser = helperData.getNewTestUser();
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

			await test.step( 'Given I have an unlaunched free site', async function () {
				newSiteDetails = await apiCreateUnlaunchedFreeSiteForUser(
					testUser,
					newUserDetails,
					helperData.getBlogName()
				);
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
			} );

			await test.step( 'And I enter the launch-site flow', async function () {
				await page.goto(
					helperData.getCalypsoURL(
						`/start/launch-site?siteSlug=${ newSiteDetails.blog_details.site_slug }`
					)
				);
			} );

			await test.step( 'And I skip the domain search', async function () {
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( 'And I open the escape hatch in the plans step', async function () {
				await pageSignupPickPlan.openEscapeHatch();
			} );

			await test.step( 'Then I see the no custom domain warning', async function () {
				await pageSignupPickPlan.validateNoCustomDomainWarning(
					newSiteDetails.blog_details.site_slug
				);
			} );

			await test.step( 'And I continue with the free plan', async function () {
				await pageSignupPickPlan.continueWithFreeViaEscapeHatch();
			} );

			await test.step( 'Then I see the launch celebration modal', async function () {
				await componentLaunchCelebration.validateVisible();
			} );
		} );

		test( 'As a new user with a free site, I can use launch-site flow to purchase a domain only', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageLogin,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			const testUser = helperData.getNewTestUser();
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

			await test.step( 'Given I have an unlaunched free site', async function () {
				newSiteDetails = await apiCreateUnlaunchedFreeSiteForUser(
					testUser,
					newUserDetails,
					helperData.getBlogName()
				);
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

			await test.step( 'And I open the escape hatch in the plans step', async function () {
				await pageSignupPickPlan.openEscapeHatch();
			} );

			await test.step( 'Then I see the domain redirect warning', async function () {
				await pageSignupPickPlan.validateDomainRedirectWarning(
					selectedDomain,
					newSiteDetails.blog_details.site_slug
				);
			} );

			await test.step( 'And I continue with the free plan', async function () {
				await pageSignupPickPlan.continueWithFreeViaEscapeHatch( new RegExp( '.*/checkout/.*' ) );
			} );

			await test.step( 'Then I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );
		} );

		test( 'As a new user with a free site, I can use the launch-site flow to pick a domain, and continue to checkout by picking the plan within the escape hatch', async ( {
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

			await test.step( 'Given I have an unlaunched free site', async function () {
				newSiteDetails = await apiCreateUnlaunchedFreeSiteForUser(
					testUser,
					newUserDetails,
					helperData.getBlogName()
				);
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

			await test.step( `And I select the ${ planName } plan via the escape hatch`, async function () {
				await pageSignupPickPlan.selectEscapeHatchWithoutSiteCreation( planName );
			} );

			await test.step( `Then I see the ${ planName } plan at checkout`, async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'And I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
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
