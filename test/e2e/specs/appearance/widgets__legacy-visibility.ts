/**
 * @group gutenberg
 */

import {
	envVariables,
	TestAccount,
	BlockWidgetEditorComponent,
	getTestAccountByFeature,
	envToFeatureKey,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

declare const browser: Browser;

// We're skipping for Atomic sites for now because the currently used theme
// doesn't support widgets.
// Mobile viewport is skipped due to https://github.com/Automattic/wp-calypso/issues/64536.
skipDescribeIf( envVariables.TEST_ON_ATOMIC || envVariables.VIEWPORT_NAME === 'mobile' )(
	'Widget (Legacy): Visibility option is present',
	function () {
		let testAccount: TestAccount;
		let page: Page;

		beforeAll( async () => {
			page = await browser.newPage();

			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );

			// Clear out existing widgets.
			const restAPIClient = new RestAPIClient( testAccount.credentials );
			await restAPIClient.deleteAllWidgets(
				testAccount.credentials.testSites?.primary.id as number
			);
		} );

		it( 'Navigate to Appearance > Widgets', async function () {
			await page.goto(
				`https://${ testAccount.credentials.testSites?.primary.url }/wp-admin/widgets.php`,
				{ timeout: 25 * 1000 }
			);
		} );

		it( 'Dismiss the Welcome modals', async function () {
			const blockWidgetEditorComponent = new BlockWidgetEditorComponent( page );
			await blockWidgetEditorComponent.dismissModals();
		} );

		// @todo: Refactor/Abstract these steps into a WidgetsEditor component
		// Skipped for mobile due to https://github.com/Automattic/wp-calypso/issues/59960
		it( 'Insert a Legacy Widget', async function () {
			await page.getByRole( 'button', { name: 'Add block' } ).click();
			await page.fill( 'input[placeholder="Search"]', 'Top Posts and Pages' );
			await page.click( 'button.editor-block-list-item-legacy-widget\\/top-posts' );
		} );

		it( 'Visibility options are shown for the Legacy Widget', async function () {
			await page.click( 'a.button:text("Visibility")' );
			await page.waitForSelector( 'div.widget-conditional' );
		} );
	}
);
