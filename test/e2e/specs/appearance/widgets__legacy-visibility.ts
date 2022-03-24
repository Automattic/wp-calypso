/**
 * @group gutenberg
 */

import {
	envVariables,
	DataHelper,
	SidebarComponent,
	TestAccount,
	BlockWidgetEditorComponent,
	skipDescribeIf,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Widgets' ), function () {
	let sidebarComponent: SidebarComponent;
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Appearance > Widgets', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Appearance', 'Widgets' );
	} );

	it( 'Dismiss the Welcome modals', async function () {
		const blockWidgetEditorComponent = new BlockWidgetEditorComponent( page );
		await blockWidgetEditorComponent.dismissModals();
	} );

	// @todo: Refactor/Abstract these steps into a WidgetsEditor component
	// Skipped for mobile due to https://github.com/Automattic/wp-calypso/issues/59960
	skipDescribeIf( envVariables.VIEWPORT_NAME === 'mobile' )(
		'Regression: Verify that the visibility option is present',
		function () {
			it( 'Insert a Legacy Widget', async function () {
				await page.click( 'button[aria-label="Add block"]' );
				await page.fill( 'input[placeholder="Search"]', 'Top Posts and Pages' );
				await page.click( 'button.editor-block-list-item-legacy-widget\\/top-posts' );
			} );

			it( 'Visibility options are shown for the Legacy Widget', async function () {
				await page.click( 'a.button:text("Visibility")' );
				await page.waitForSelector( 'div.widget-conditional' );
			} );
		}
	);
} );
