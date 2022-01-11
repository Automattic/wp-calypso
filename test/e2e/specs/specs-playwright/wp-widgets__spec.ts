/**
 * @group gutenberg
 */

import {
	BrowserHelper,
	DataHelper,
	SidebarComponent,
	setupHooks,
	TestAccount,
	BlockWidgetEditorComponent,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const accountName = BrowserHelper.targetGutenbergEdge()
	? 'gutenbergSimpleSiteEdgeUser'
	: 'gutenbergSimpleSiteUser';

describe( DataHelper.createSuiteTitle( 'Widgets' ), function () {
	let sidebarComponent: SidebarComponent;
	let page: Page;

	setupHooks( async ( args ) => {
		page = args.page;

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Appearance > Widgets', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Appearance', 'Widgets' );
	} );

	it( 'Dismiss the Welcome Guide Notice if displayed', async function () {
		const blockWidgetEditorComponent = new BlockWidgetEditorComponent( page );
		await blockWidgetEditorComponent.dismissWelcomeModal();
	} );

	// @todo: Refactor/Abstract these steps into a WidgetsEditor component
	describe( 'Regression: Verify that the visibility option is present', function () {
		it( 'Insert a Legacy Widget', async function () {
			await page.click( 'button[aria-label="Add block"]' );
			await page.fill( 'input[placeholder="Search"]', 'Top Posts and Pages' );
			await page.click( 'button.editor-block-list-item-legacy-widget\\/top-posts' );
		} );

		it( 'Visibility options are shown for the Legacy Widget', async function () {
			await page.click( 'a.button:text("Visibility")' );
			await page.waitForSelector( 'div.widget-conditional' );
		} );
	} );
} );
