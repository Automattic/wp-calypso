/**
 * @group calypso-pr
 */

import {
	DataHelper,
	LoginPage,
	SupportComponent,
	setupHooks,
	GutenboardingFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Support: Show me where' ), function () {
	let page: Page;
	let loginPage: LoginPage;

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		loginPage = new LoginPage( page );
		await loginPage.visit();
	} );

	describe.each( [
		{ siteType: 'Simple', testAccount: 'defaultUser' },
		{ siteType: 'Atomic', testAccount: 'eCommerceUser' },
	] )( 'Search and view a support article ($siteType)', function ( { testAccount } ) {
		let supportComponent: SupportComponent;
		let gutenboardingFlow: GutenboardingFlow;

		afterAll( async () => {
			await loginPage.visit();
			await loginPage.clickChangeAccount();
		} );

		it( `Log in with ${ testAccount }`, async function () {
			await loginPage.logInWithTestAccount( testAccount );
		} );

		it( 'Search for help: Create a site', async function () {
			supportComponent = new SupportComponent( page );
			await supportComponent.showSupportCard();
			await supportComponent.search( 'create a site' );
			const results = await supportComponent.getResults( 'article' );
			expect( results.length ).toBeGreaterThan( 0 );
		} );

		it( 'Click on result under Show me where', async function () {
			await Promise.all( [ page.waitForNavigation(), supportComponent.clickResult( 'where', 1 ) ] );
		} );

		it( 'Gutenboarding flow is started', async function () {
			gutenboardingFlow = new GutenboardingFlow( page );
			await gutenboardingFlow.enterSiteTitle( DataHelper.getRandomPhrase() );
		} );

		it( 'Exit Gutenboarding flow', async function () {
			await gutenboardingFlow.clickWpLogo();
			await page.waitForURL( '**/home/**' );
		} );
	} );
} );
