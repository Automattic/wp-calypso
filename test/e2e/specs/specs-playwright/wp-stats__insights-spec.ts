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
		${ 'Atomic' } | ${ 'wooCommerceUser' }
		${ 'Simple' } | ${ 'defaultUser' }
	`( 'View Insights ($siteType)', function ( { user } ) {
		it( 'Log In', async function () {
			const loginFlow = new LoginFlow( page, user );
			await loginFlow.logIn();
		} );

		it( 'Navigate to Settings', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Settings', 'General' );
			await page.waitForSelector( ':has-text("Manage your site settings")' );
		} );
		it( 'Navigate to Tools', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Tools', 'Marketing' );
			await page.waitForSelector( ':has-text("Explore tools")' );
		} );

		it( 'Navigate to Upgrades', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Upgrades', 'Plans' );
			await page.waitForSelector( ':has-text("Learn about the features")' );
		} );

		it( 'Navigate to Media', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await page.reload();
			await sidebarComponent.navigate( 'Media' );
			await page.waitForSelector( ':has-text("Manage all the media")' );
		} );

		it( 'Navigate to Apperance > Themes', async function () {
			await page.reload();
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Appearance', 'Themes' );
			await page.waitForSelector( ':has-text("Select or update the visual")' );
		} );

		it( 'Navigate to Users > All Users', async function () {
			await page.reload();
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Users', 'All Users' );
			await page.waitForSelector( ':has-text("Invite contributors to your site")' );
		} );

		it( 'Navigate to Stats', async function () {
			await page.reload();
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Stats' );
			await page.waitForSelector( ':has-text("Learn more about the activity")' );
		} );

		it( 'Navigate to Apperance > Widgets', async function () {
			await page.reload();
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Appearance', 'Widgets' );
		} );
	} );
} );
