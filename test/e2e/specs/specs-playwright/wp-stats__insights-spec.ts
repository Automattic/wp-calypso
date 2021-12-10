/**
 * @group calypso-pr
 */

import {
	setupHooks,
	DataHelper,
	LoginPage,
	StatsPage,
	SidebarComponent,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Stats' ), function () {
	let page: Page;
	let loginPage: LoginPage;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		loginPage = new LoginPage( page );
		await loginPage.visit();
	} );

	describe.each`
		siteType      | testAccount
		${ 'Simple' } | ${ 'defaultUser' }
		${ 'Atomic' } | ${ 'eCommerceUser' }
	`( 'View Insights ($siteType)', function ( { testAccount } ) {
		afterAll( async () => {
			await loginPage.visit();
			await loginPage.clickChangeAccount();
		} );

		it( `Log in with ${ testAccount }`, async function () {
			await loginPage.logInWithTestAccount( testAccount );
		} );

		it( 'Navigate to Stats', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Stats' );
		} );

		it( 'Click on Insights tab', async function () {
			const statsPage = new StatsPage( page );
			await statsPage.clickTab( 'Insights' );
		} );
	} );
} );
