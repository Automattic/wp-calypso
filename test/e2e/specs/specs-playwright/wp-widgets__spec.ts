import { DataHelper, LoginFlow, SidebarComponent, setupHooks } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const user =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

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
		const widgetsMenu = await page.waitForSelector( '"Customising ▸ Widgets"' );
		await widgetsMenu.waitForElementState( 'stable' );
	} );

	it( 'Dismiss the Welcome Guide Notice if displayed', async function () {
		const button = await page.$( 'button:text("Got it")' );
		if ( button ) {
			await button.click();
			await button.waitForElementState( 'hidden' );
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
