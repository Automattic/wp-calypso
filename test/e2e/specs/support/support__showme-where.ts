/**
 * @group calypso-pr
 */

import { SupportComponent, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( 'Support: Show me where', function () {
	let page: Page;
	let newPage: Page;
	let supportComponent: SupportComponent;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Search for help: Create a site', async function () {
		supportComponent = new SupportComponent( page );

		await supportComponent.openPopover();

		await supportComponent.search( 'create a site' );
	} );

	it( 'Click on result under Show me where', async function () {
		[ newPage ] = await Promise.all( [
			page.waitForEvent( 'popup' ),
			supportComponent.clickResult( 'Create a new site' ),
		] );
	} );

	it( 'Signup flow is started', async function () {
		await newPage.waitForURL( /start/ );
	} );
} );
