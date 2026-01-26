import {
	NewTestUserDetails,
	NewUserResponse,
	NewSiteResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Domain flow: Purchase a domain for an existing free site',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const siteCreationPlan = 'Free';
		const domainAdditionPlan = 'Personal';
		let selectedDomain: string;
		let testUser: NewTestUserDetails;
		let newUserDetails: NewUserResponse;
		let newSiteDetails: NewSiteResponse;

		test( 'As a new user, I can create a free site and then add a domain with a plan upgrade', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			componentSiteSelect,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			testUser = helperData.getNewTestUser();

			await test.step( 'When I enter the onboarding flow', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I skip the domains step', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( `And I select the ${ siteCreationPlan } plan`, async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan(
					siteCreationPlan,
					new RegExp( '.*/home/.*' )
				);
			} );

			await test.step( 'And I enter the domain flow', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup/domain' ) );
			} );

			await test.step( 'And I search for a domain', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
			} );

			await test.step( 'And I add the first suggestion to the cart', async function () {
				selectedDomain = await componentDomainSearch.selectFirstSuggestion();
			} );

			await test.step( 'And I continue to the next step', async function () {
				await componentDomainSearch.continue();
			} );

			await test.step( 'And I select existing site option', async function () {
				await componentSelectItems.clickButton( 'Existing WordPress.com site', 'Select a site' );
			} );

			await test.step( 'And I select the site', async function () {
				await componentSiteSelect.selectSite(
					newSiteDetails.blog_details.site_slug as string,
					false
				);
			} );

			await test.step( `And I select the ${ domainAdditionPlan } plan`, async function () {
				await pageSignupPickPlan.selectPlanWithoutSiteCreation( domainAdditionPlan );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ domainAdditionPlan }` );
			} );

			await test.step( 'And I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );
		} );

		test.afterAll( 'Delete all user accounts generated', async function () {
			if ( newUserDetails && testUser ) {
				const restAPIClient = new RestAPIClient(
					{
						username: testUser.username,
						password: testUser.password,
					},
					newUserDetails.body.bearer_token
				);

				await apiCloseAccount( restAPIClient, {
					userID: newUserDetails.body.user_id,
					username: newUserDetails.body.username,

					email: testUser.email,
				} );
			}
		} );
	}
);
