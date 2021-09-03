/**
 * @group calypso-pr
 */

import {
	setupHooks,
	DataHelper,
	LoginFlow,
	StatsPage,
	SidebarComponent,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Stats' ), function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe.each`
		siteType      | user
		${ 'Simple' } | ${ 'defaultUser' }
		${ 'Atomic' } | ${ 'wooCommerceUser' }
	`( 'View Insights ($siteType)', function ( { user } ) {
		it( 'Log In', async function () {
			const loginFlow = new LoginFlow( page, user );
			await loginFlow.logIn();
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
