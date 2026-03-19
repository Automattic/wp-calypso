import {
	RestAPIClient,
	type NewSiteResponse,
	type NewTestUserDetails,
	type NewUserResponse,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount, apiDeleteSite, swapBaseUrl } from '../shared';

test.describe(
	'Onboarding: Launch site from WP Admin',
	{ tag: [ tags.CALYPSO_RELEASE, tags.JETPACK_WPCOM_INTEGRATION, tags.DESKTOP_ONLY ] },
	() => {
		const accountsToCleanup: {
			testUser: NewTestUserDetails;
			newUserDetails: NewUserResponse;
			newSiteDetails?: NewSiteResponse;
		}[] = [];

		test( 'As a user with an unlaunched site, I can launch it via the WP Admin launch button and be redirected back at the end of the flow', async ( {
			page,
			componentDomainSearch,
			componentLaunchCelebration,
			helperData,
			pageSignupPickPlan,
			environment,
			pageUserSignUp,
			viewportName,
		} ) => {
			test.skip(
				viewportName === 'mobile',
				'Skipping for mobile viewport as the launch site button is not available'
			);

			const testUser = helperData.getNewTestUser();
			let newUserDetails: NewUserResponse;
			let newSiteDetails: NewSiteResponse;
			let siteSlug: string;

			await test.step( 'When I enter the onboarding flow', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup/onboarding' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I select a .wordpress.com domain name', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( 'And I select the WordPress.com Free plan', async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( 'Free', new RegExp( '.*/home/.*' ) );
				siteSlug = newSiteDetails.blog_details.site_slug;
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
			} );

			await test.step( 'When I navigate to WP Admin for my new site', async function () {
				await page.goto( `https://${ siteSlug }/wp-admin` );
			} );

			await test.step( 'And I click on the launch site button in the admin bar', async function () {
				const launchSiteButtonHref = await page
					.getByRole( 'menuitem', { name: 'Launch site' } )
					.getAttribute( 'href' );

				if ( ! launchSiteButtonHref ) {
					throw new Error( 'Launch site button not found' );
				}

				const launchSiteUrl = new URL( launchSiteButtonHref );
				expect( launchSiteUrl.searchParams.get( 'siteSlug' ) ).toBe( siteSlug );
				expect( launchSiteUrl.searchParams.get( 'ref' ) ).toBe( 'wp-admin' );

				const launchSiteUrlWithSwappedOrigin = swapBaseUrl(
					launchSiteButtonHref,
					environment.CALYPSO_BASE_URL
				);

				await page.goto( launchSiteUrlWithSwappedOrigin );
			} );

			await test.step( 'Then I am redirected to the launch-site flow on WPCOM', async function () {
				await page.waitForURL( /start\/launch-site/, { timeout: 30_000 } );
			} );

			await test.step( 'And I skip the domain search', async function () {
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( 'And I open the escape hatch to skip the plan', async function () {
				await pageSignupPickPlan.openEscapeHatch();
			} );

			await test.step( 'And I continue with the Free plan', async function () {
				await pageSignupPickPlan.continueWithFreeViaEscapeHatch( new RegExp( '.*/wp-admin.*' ) );
			} );

			await test.step( 'Then I am redirected back to WP Admin', async function () {
				expect( page.url() ).toMatch( /\/wp-admin/ );
			} );

			await test.step( 'And the launch celebration modal is displayed', async function () {
				await componentLaunchCelebration.validateVisible();
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
