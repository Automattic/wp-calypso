/**
 * @group calypso-pr
 */

import {
	DataHelper,
	LoginFlow,
	SidebarComponent,
	SupportComponent,
	setupHooks,
	GutenboardingFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Support: Show me where' ), function () {
	let page: Page;

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	describe.each( [
		{ siteType: 'Simple', user: 'defaultUser' },
		{ siteType: 'Atomic', user: 'wooCommerceUser' },
	] )( 'Search and view a support article ($siteType)', function ( { user } ) {
		let supportComponent: SupportComponent;
		let gutenboardingFlow: GutenboardingFlow;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page, user );
			await loginFlow.logIn();
		} );

		it( 'Navigate to Tools > Marketing', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Tools', 'Marketing' );
		} );

		it( 'Open support popover', async function () {
			supportComponent = new SupportComponent( page );
			await supportComponent.openPopover();
		} );

		it( 'Search for help: Create a site', async function () {
			await supportComponent.search( 'create a site' );
		} );

		it( 'Click on result under Show me where', async function () {
			await supportComponent.clickResult( 'where', 1 );
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
