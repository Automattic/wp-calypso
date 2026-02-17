import {
	BrowserManager,
	cancelAtomicPurchaseFlow,
	NewSiteResponse,
	NewTestUserDetails,
	NewUserResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { tags, test, expect } from '../../lib/pw-base';
import { apiCloseAccount, apiDeleteSite } from '../shared';

test.describe(
	'Setup Domain Flows',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const accountsToCleanup: {
			testUser: NewTestUserDetails;
			newUserDetails: NewUserResponse;
			newSiteDetails?: NewSiteResponse;
		}[] = [];

		test( 'As a new user I can connect an external domain to a new site', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUseADomainIAlreadyOwn,
			pageUserSignUp,
		} ) => {
			const targetDomain = 'testwoo.com';
			const planName = 'Personal';
			const testUser = helperData.getNewTestUser();
			let newUserDetails: NewUserResponse;

			await test.step( 'When I enter the domain setup flow', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup/domain' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I search for a domain', async function () {
				await componentDomainSearch.search( targetDomain );
			} );

			await test.step( 'And I click the "Bring it over" button', async function () {
				await componentDomainSearch.clickBringItOver();
			} );

			await test.step( 'And I click the connect button', async function () {
				await pageUseADomainIAlreadyOwn.clickButtonToConnectDomain();
			} );

			await test.step( 'And I select the "New site" option', async function () {
				await componentSelectItems.clickButton( 'New site', 'Create a new site' );
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				const newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'And I see the domain connection product at checkout', async function () {
				await pageCartCheckout.validateCartItem( targetDomain, 'Domain Connection' );
			} );
		} );

		test( 'As a new user I can purchase only a domain (no plan)', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			helperData,
			pageCartCheckout,
			pageUserSignUp,
		} ) => {
			let selectedDomain: string;

			await test.step( 'When I enter the domain setup flow', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup/domain' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				const testUser = helperData.getNewTestUser();
				const newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
				accountsToCleanup.push( { testUser, newUserDetails } );
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

			await test.step( 'And I select domain only option', async function () {
				await componentSelectItems.clickButton( 'Just buy a domain', 'Continue' );
			} );

			await test.step( 'Then I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );
		} );

		test( 'As a new user, I can create a free site and then add a domain WITHOUT a plan upgrade', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			componentSiteSelect,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			const siteCreationPlan = 'Free';
			const testUser = helperData.getNewTestUser();
			let newUserDetails: NewUserResponse;
			let newSiteDetails: NewSiteResponse;
			let selectedDomain: string;

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
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
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

			await test.step( 'And I select the Free plan', async function () {
				await pageSignupPickPlan.selectEscapeHatchWithoutSiteCreation( 'Free' );
			} );

			await test.step( 'And I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );

				await expect( page ).toHaveURL(
					new RegExp( `/checkout/${ newSiteDetails.blog_details.site_slug }` )
				);
			} );
		} );

		test( 'As a new user, I can create a free site and then add a domain WITH a plan upgrade', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			componentSiteSelect,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			const siteCreationPlan = 'Free';
			const domainAdditionPlan = 'Personal';
			const testUser = helperData.getNewTestUser();
			let newUserDetails: NewUserResponse;
			let newSiteDetails: NewSiteResponse;
			let selectedDomain: string;

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
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
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

		test( 'As a new user, I can create a paid site, add a domain, then cancel the plan', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			componentSiteSelect,
			componentMeSidebar,
			componentNotice,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
			pageMyProfile,
			pagePurchases,
		} ) => {
			const planName = 'Personal';
			let selectedDomain: string;
			const testUser = helperData.getNewTestUser();
			let newUserDetails: NewUserResponse;
			let newSiteDetails: NewSiteResponse;

			await test.step( 'When I enter the onboarding flow', async function () {
				BrowserManager.setStoreCookie( page, { currency: 'USD' } );
				await page.goto( helperData.getCalypsoURL( '/setup' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I skip the domains step', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
			} );

			await test.step( 'Then I can see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'When I enter billing and payment details', async function () {
				const paymentDetails = helperData.getTestPaymentDetails();
				await pageCartCheckout.enterBillingDetails( paymentDetails );
				await pageCartCheckout.enterPaymentDetails( paymentDetails );
			} );

			await test.step( 'When I can make the purchase', async function () {
				await pageCartCheckout.purchase( { timeout: 90 * 1000 } );
			} );

			await test.step( 'Then I can see the dashboard with a success message', async function () {
				await componentNotice.noticeShown( `You're in! The ${ planName } Plan is now active.`, {
					timeout: 60 * 1000,
				} );
			} );

			await test.step( 'When I enter the domain flow', async function () {
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

			await test.step( 'Then I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );

			await test.step( 'And I navigate to Me > Purchases', async function () {
				await pageMyProfile.visit();
				await componentMeSidebar.openMobileMenu();
				await componentMeSidebar.navigate( 'Purchases' );
			} );

			await test.step( 'And I view details of the purchased plan', async function () {
				await pagePurchases.clickOnPurchase(
					`WordPress.com ${ planName }`,
					newSiteDetails.blog_details.site_slug as string
				);
				await pagePurchases.cancelPurchase( 'Cancel plan' );
			} );

			await test.step( 'And I cancel the plan renewal', async function () {
				await cancelAtomicPurchaseFlow( page, {
					reason: 'Another reason…',
					customReasonText: 'E2E TEST CANCELLATION',
				} );

				await componentNotice.noticeShown(
					'Your refund has been processed and your purchase removed.',
					{
						timeout: 30 * 1000,
					}
				);
			} );
		} );

		test( 'As a new user, I can purchase a domain for a new site', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			const planName = 'Personal';
			let selectedDomain: string;
			const testUser = helperData.getNewTestUser();
			let newUserDetails: NewUserResponse;

			await test.step( 'When I enter the domain setup flow', async function () {
				BrowserManager.setStoreCookie( page, { currency: 'USD' } );
				await page.goto( helperData.getCalypsoURL( '/setup/domain' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
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

			await test.step( 'And I select new site option', async function () {
				await componentSelectItems.clickButton( 'New site', 'Create a new site' );
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				const newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'And I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );
		} );

		test( 'As a new user, I can create a free site and then add a domain using pre-selected site flow', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			const planName = 'Personal';
			const testUser = helperData.getNewTestUser();
			let selectedDomain: string;
			let newSiteDetails: NewSiteResponse;
			let newUserDetails: NewUserResponse;

			await test.step( 'When I enter the onboarding flow', async function () {
				BrowserManager.setStoreCookie( page, { currency: 'USD' } );
				await page.goto( helperData.getCalypsoURL( '/setup' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I skip the domains step', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
			} );

			await test.step( 'And I enter the domain flow with pre-selected site', async function () {
				await page.goto(
					helperData.getCalypsoURL(
						`/setup/domain?siteSlug=${ newSiteDetails.blog_details.site_slug as string }`
					)
				);
			} );

			await test.step( 'And I add the first suggestion to the cart', async function () {
				selectedDomain = await componentDomainSearch.selectFirstSuggestion();
			} );

			await test.step( 'And I continue to the next step', async function () {
				await componentDomainSearch.continue();
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

		test( 'As a new user, I can create a paid site, add a domain using pre-selected site flow, then cancel the plan', async ( {
			page,
			componentDomainSearch,
			componentMeSidebar,
			componentNotice,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
			pageMyProfile,
			pagePurchases,
		} ) => {
			const planName = 'Personal';
			const testUser = helperData.getNewTestUser();
			let selectedDomain: string;
			let newSiteDetails: NewSiteResponse;
			let newUserDetails: NewUserResponse;

			await test.step( 'When I enter the onboarding flow', async function () {
				BrowserManager.setStoreCookie( page, { currency: 'USD' } );
				await page.goto( helperData.getCalypsoURL( '/setup' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I skip the domains step', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'When I enter billing and payment details', async function () {
				const paymentDetails = helperData.getTestPaymentDetails();
				await pageCartCheckout.enterBillingDetails( paymentDetails );
				await pageCartCheckout.enterPaymentDetails( paymentDetails );
			} );

			await test.step( 'And I make the purchase', async function () {
				await pageCartCheckout.purchase( { timeout: 90 * 1000 } );
			} );

			await test.step( 'Then I can see the dashboard with a success message', async function () {
				await componentNotice.noticeShown( `You're in! The ${ planName } Plan is now active.`, {
					timeout: 60 * 1000,
				} );
			} );

			await test.step( 'When I enter the domain flow with pre-selected site', async function () {
				await page.goto(
					helperData.getCalypsoURL(
						`/setup/domain?siteSlug=${ newSiteDetails.blog_details.site_slug as string }`
					)
				);
			} );

			await test.step( 'And I add the first suggestion to the cart', async function () {
				selectedDomain = await componentDomainSearch.selectFirstSuggestion();
			} );

			await test.step( 'And I continue to the next step', async function () {
				await componentDomainSearch.continue();
			} );

			await test.step( 'Then I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );

			await test.step( 'And I navigate to Me > Purchases', async function () {
				await pageMyProfile.visit();
				await componentMeSidebar.openMobileMenu();
				await componentMeSidebar.navigate( 'Purchases' );
			} );

			await test.step( 'And I view details of the purchased plan', async function () {
				await pagePurchases.clickOnPurchase(
					`WordPress.com ${ planName }`,
					newSiteDetails.blog_details.site_slug as string
				);
				await pagePurchases.cancelPurchase( 'Cancel plan' );
			} );

			await test.step( 'And I cancel the plan renewal', async function () {
				await cancelAtomicPurchaseFlow( page, {
					reason: 'Another reason…',
					customReasonText: 'E2E TEST CANCELLATION',
				} );

				await componentNotice.noticeShown(
					'Your refund has been processed and your purchase removed.',
					{
						timeout: 30 * 1000,
					}
				);
			} );
		} );

		test( 'As a new user, I can transfer an external domain to a new site', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUseADomainIAlreadyOwn,
			pageUserSignUp,
		} ) => {
			const targetDomain = 'a8ctesting.com';
			const planName = 'Personal';
			const testUser = helperData.getNewTestUser();
			let newUserDetails: NewUserResponse;

			await test.step( 'When I enter the domain setup flow', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup/domain' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I search for a domain', async function () {
				await componentDomainSearch.search( targetDomain );
			} );

			await test.step( 'And I click the "Bring it over" button', async function () {
				await componentDomainSearch.clickBringItOver();
			} );

			await test.step( 'And I click the transfer button', async function () {
				await pageUseADomainIAlreadyOwn.clickButtonToTransferDomain();
			} );

			await test.step( 'And I select the "New site" option', async function () {
				await componentSelectItems.clickButton( 'New site', 'Create a new site' );
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				const newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
				accountsToCleanup.push( { testUser, newUserDetails, newSiteDetails } );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'And I see the domain transfer product at checkout', async function () {
				await pageCartCheckout.validateCartItem( targetDomain, 'Domain Transfer' );
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
