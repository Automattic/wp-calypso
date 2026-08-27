import {
	BrowserManager,
	DataHelper,
	RestAPIClient,
	type NewSiteResponse,
	type NewUserResponse,
} from '@automattic/calypso-e2e';
import { expect, skipIfNotTrunk, tags, test } from '../../lib/pw-base';
import { apiCancelAtomicPlan, apiCloseAccount, recordAccountLeakMarker } from '../shared';

test.describe(
	DataHelper.createSuiteTitle( 'Onboarding: Publish a Playground site to Atomic' ),
	{ tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS, tags.DESKTOP_ONLY ] },
	() => {
		skipIfNotTrunk();

		const testUser = DataHelper.getNewTestUser( { usernamePrefix: 'playground' } );
		const blogName = testUser.siteName;
		const playgroundSiteTitle = `Playground import ${ blogName }`;
		let signupAttempted = false;
		let newUserDetails: NewUserResponse | undefined;
		let newSiteDetails: NewSiteResponse | undefined;

		test.afterAll( async () => {
			if ( ! newUserDetails ) {
				if ( signupAttempted ) {
					recordAccountLeakMarker( {
						username: testUser.username,
						email: testUser.email,
						error: 'Signup did not return account details; account creation status is unknown.',
					} );
				}
				return;
			}

			test.setTimeout( 300 * 1000 );
			const restAPIClient = new RestAPIClient(
				{ username: testUser.username, password: testUser.password },
				newUserDetails.body.bearer_token
			);

			await apiCancelAtomicPlan( restAPIClient, newSiteDetails?.blog_details.blogid );
			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );

		test( 'As a new user, I can publish my Playground site to WP Admin on Atomic', async ( {
			componentDomainSearch,
			page,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			test.setTimeout( 30 * 60 * 1000 );

			let playgroundId: string;
			let selectedFreeDomain: string;

			await test.step( 'Given the store is configured for sandbox purchases', async () => {
				await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
			} );

			await test.step( 'When I open the Playground onboarding flow', async () => {
				await page.goto( DataHelper.getCalypsoURL( '/setup/onboarding/playground' ) );
			} );

			await test.step( 'Then a persisted Playground is ready to launch', async () => {
				const launchButton = page.getByRole( 'button', { name: 'Launch on WordPress.com' } );
				await expect( launchButton ).toBeEnabled( { timeout: 120 * 1000 } );
				await expect( page.locator( 'iframe[title="WordPress Playground"]' ) ).toBeVisible();

				const generatedPlaygroundId = new URL( page.url() ).searchParams.get( 'playground' );
				expect( generatedPlaygroundId ).toBeTruthy();
				playgroundId = generatedPlaygroundId as string;
			} );

			await test.step( 'And I customize the site inside Playground', async () => {
				const playground = page
					.frameLocator( 'iframe[title="WordPress Playground"]' )
					.frameLocator( 'iframe[title="The WordPress site"]' );
				await expect( playground.locator( '#wpadminbar' ) ).toBeVisible( {
					timeout: 60 * 1000,
				} );
				await playground.locator( '#wp-admin-bar-site-name' ).hover();
				await playground.locator( '#wp-admin-bar-dashboard > a' ).click();
				await playground.getByRole( 'link', { name: 'Settings', exact: true } ).first().click();

				const siteTitle = playground.getByRole( 'textbox', { name: 'Site Title' } );
				await siteTitle.fill( playgroundSiteTitle );
				await playground.getByRole( 'button', { name: 'Save Changes' } ).click();
				await expect( playground.getByText( 'Settings saved.' ) ).toBeVisible();
				await expect( siteTitle ).toHaveValue( playgroundSiteTitle );
			} );

			await test.step( 'When I launch the Playground site on WordPress.com', async () => {
				await page.getByRole( 'button', { name: 'Launch on WordPress.com' } ).click();
				await expect( page ).not.toHaveURL( /\/setup\/onboarding\/playground/ );
			} );

			await test.step( 'And I sign up as a new user', async () => {
				signupAttempted = true;
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I choose a free WordPress.com address', async () => {
				await componentDomainSearch.search( blogName );
				selectedFreeDomain = await componentDomainSearch.skipPurchase();
				expect( selectedFreeDomain ).toBe( `${ blogName }.wordpress.com` );
			} );

			await test.step( 'And I select the Business plan', async () => {
				newSiteDetails = await pageSignupPickPlan.selectPlan( 'Business' );
				expect( newSiteDetails.blog_details.site_slug ).toBe( selectedFreeDomain );
			} );

			await test.step( 'Then the Business plan is ready for purchase', async () => {
				await pageCartCheckout.validateCartItem( 'WordPress.com Business' );
			} );

			await test.step( 'When I enter billing and payment details', async () => {
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await pageCartCheckout.enterBillingDetails( paymentDetails );
				await pageCartCheckout.enterPaymentDetails( paymentDetails );
			} );

			await test.step( 'And I purchase the plan', async () => {
				await Promise.all( [
					page.waitForURL(
						( url ) =>
							url.pathname.includes( '/setup/site-setup/importerPlayground' ) &&
							url.searchParams.get( 'playground' ) === playgroundId,
						{ timeout: 120 * 1000 }
					),
					pageCartCheckout.purchase( { timeout: 90 * 1000 } ),
				] );
			} );

			await test.step( 'Then the original Playground is exported to the new site', async () => {
				const importerUrl = new URL( page.url() );
				expect( importerUrl.searchParams.get( 'playground' ) ).toBe( playgroundId );
				expect( importerUrl.searchParams.get( 'siteId' ) ).toBe(
					String( newSiteDetails!.blog_details.blogid )
				);

				await page.waitForURL(
					( url ) =>
						url.pathname.includes( '/setup/site-setup/importerWordpress' ) &&
						url.searchParams.get( 'playground' ) === playgroundId,
					{ timeout: 240 * 1000 }
				);
			} );

			await test.step( 'And the Playground import completes', async () => {
				await expect(
					page.getByText(
						'Feel free to close this window. We’ll email you when your new site is ready.'
					)
				).toBeVisible( { timeout: 120 * 1000 } );
				await expect( page.getByRole( 'heading', { name: 'Hooray!' } ) ).toBeVisible( {
					timeout: 10 * 60 * 1000,
				} );
				await expect(
					page.getByText( 'Congratulations. Your content was successfully imported.' )
				).toBeVisible();
			} );

			await test.step( 'When I continue to the imported site', async () => {
				const expectedAtomicHostname = selectedFreeDomain.replace(
					/\.wordpress\.com$/,
					'.wpcomstaging.com'
				);

				await Promise.all( [
					page.waitForURL(
						( url ) =>
							url.hostname === expectedAtomicHostname && url.pathname.startsWith( '/wp-admin' ),
						{ timeout: 180 * 1000 }
					),
					page.getByRole( 'button', { name: 'Go to dashboard' } ).click(),
				] );
			} );

			await test.step( 'Then I am authenticated in WP Admin on the named Atomic site', async () => {
				const expectedAtomicHostname = `${ blogName }.wpcomstaging.com`;
				const wpAdminUrl = new URL( page.url() );
				expect( wpAdminUrl.hostname ).toBe( expectedAtomicHostname );
				expect( wpAdminUrl.pathname ).toMatch( /^\/wp-admin/ );
				await expect( page.locator( '#wpadminbar' ) ).toBeVisible( { timeout: 60 * 1000 } );
			} );

			await test.step( 'And my Playground changes exist on the Atomic site', async () => {
				const expectedAtomicHostname = `${ blogName }.wpcomstaging.com`;
				await page.goto( `https://${ expectedAtomicHostname }/wp-admin/options-general.php` );
				await expect( page.getByRole( 'textbox', { name: 'Site Title' } ) ).toHaveValue(
					playgroundSiteTitle,
					{ timeout: 60 * 1000 }
				);
			} );
		} );
	}
);
