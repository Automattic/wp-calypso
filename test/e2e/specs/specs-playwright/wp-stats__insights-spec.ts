/**
 * @group calypso-pr
 */

import {
	setupHooks,
	DataHelper,
	StatsPage,
	SidebarComponent,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Stats' ), function () {
	let page: Page;
	let testAccount: TestAccount;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe.each`
		siteType      | accountName
		${ 'Simple' } | ${ 'defaultUser' }
		${ 'Atomic' } | ${ 'eCommerceUser' }
	`( 'View Insights ($siteType)', function ( { accountName } ) {
		beforeAll( async () => {
			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		afterAll( async () => {
			await testAccount.clearAuthenticationState( page );
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
