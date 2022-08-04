/**
 * @group quarantined
 */

import {
	DataHelper,
	SidebarComponent,
	SupportComponent,
	TestAccount,
	TestAccountName,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Support: Popover' ), function () {
	let page: Page;
	let supportComponent: SupportComponent;

	describe.each( [
		{ sectionItem: 'Tools', sectionSubItem: 'Marketing' },
		{ sectionItem: 'Appearance', sectionSubItem: 'Editor' },
	] )( 'In section $sectionItem -> $sectionSubItem', function ( { sectionItem, sectionSubItem } ) {
		describe( 'Still need help Simple', function () {
			beforeAll( async () => {
				page = await browser.newPage();

				const testAccount = new TestAccount( 'defaultUser' );
				await testAccount.authenticate( page );
			} );

			it( 'Navigate to Tools > Marketing', async function () {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( sectionItem, sectionSubItem );
			} );

			it( 'Open support popover', async function () {
				supportComponent = new SupportComponent( page, { inIFrame: sectionSubItem === 'Editor' } );
				await supportComponent.openPopover();
			} );

			it( 'Click still need help', async function () {
				await supportComponent.clickStillNeedHelpButton();
			} );

			it( 'Click on Email support', async function () {
				await supportComponent.clickEmailSupportButton();
			} );
		} );
	} );

	describe( 'Still need help Atomic', function () {
		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( 'atomicUser10percent' as TestAccountName );
			await testAccount.authenticate( page );
		} );

		it( 'Navigate to Tools > Marketing', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Tools', 'Marketing' );
		} );

		it( 'Open support popover', async function () {
			supportComponent = new SupportComponent( page );
			await supportComponent.openPopover();
		} );

		it( 'Still need help button should open in new tab', async function () {
			const button = supportComponent.getStillNeedHelpButton();
			await expect( await button.getAttribute( 'target' ) ).toBe( '_blank' );
		} );
	} );
} );
