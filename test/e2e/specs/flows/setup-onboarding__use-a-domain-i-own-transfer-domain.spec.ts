import {
	NewTestUserDetails,
	NewUserResponse,
	NewSiteResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { tags, test, expect } from '../../lib/pw-base';
import { apiCloseAccount, apiDeleteSite } from '../shared';

test.describe(
	'Onboarding flow: Purchase domain transfer and plan',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const domain = 'a8ctesting.com';
		const planName = 'Personal';
		let testUser: NewTestUserDetails;
		let newUserDetails: NewUserResponse;
		let newSiteDetails: NewSiteResponse;

		test( 'As a new user, I can complete the onboarding flow with domain transfer and plan purchase', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUseADomainIAlreadyOwn,
			pageUserSignUp,
		} ) => {
			testUser = helperData.getNewTestUser();
			const blogName = helperData.getBlogName();

			await test.step( 'When I enter the onboarding flow', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup/onboarding' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I search for a domain', async function () {
				await componentDomainSearch.search( blogName );
			} );

			await test.step( 'And I click the "Use a domain I already own" button', async function () {
				await componentDomainSearch.clickUseADomainIAlreadyOwn();
			} );

			await test.step( 'And I fill the "Use a domain I own" input', async function () {
				expect( await pageUseADomainIAlreadyOwn.getDomainInputValue() ).toBe( blogName );
				await pageUseADomainIAlreadyOwn.fillUseDomainIOwnInput( domain );
			} );

			await test.step( 'And I select the "Transfer your domain" option', async function () {
				await pageUseADomainIAlreadyOwn.selectTransferYourDomain();
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'And I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( domain );
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
