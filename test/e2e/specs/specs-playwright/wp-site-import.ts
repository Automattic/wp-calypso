/**
 * @group calypso-pr
 */

import {
	setupHooks,
	DataHelper,
	LoginPage,
	SidebarComponent,
	SiteImportPage,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Site Import' ), function () {
	let siteImportPage: SiteImportPage;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'defaultUser' } );
	} );

	it( 'Navigate to Tools > Import', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Tools', 'Import' );
	} );

	it.each( SiteImportPage.services )( 'Select service provider: %s', async function ( service ) {
		siteImportPage = new SiteImportPage( page );
		await siteImportPage.selectService( service );
		await siteImportPage.verifyImporter( service );
		await siteImportPage.cancel();
	} );
} );
