import { DataHelper, LoginFlow, SidebarComponent, setupHooks } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const user = 'defaultUser';

describe( DataHelper.createSuiteTitle( 'Widgets' ), function () {
	let sidebarComponent: SidebarComponent;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, user );
		await loginFlow.logIn();
	} );

	// @todo: Refactor/Abstract these steps into a WidgetsEditor component
	it( 'Navigate to the Block Widgets Editor', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Appearance', 'Widgets' );
	} );

	it( 'Dismiss the Welcome Guide Notice', async function () {
		await page.waitForLoadState( 'networkidle' );
		const btnSelector = 'button:text("Got it")';

		if ( await page.isVisible( btnSelector ) ) {
			await page.click( btnSelector );
		}
	} );

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
