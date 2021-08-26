import { DataHelper, LoginFlow, SidebarComponent, setupHooks } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const user = 'gutenbergSimpleSiteUser';

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

	it( 'Dismiss the Welcome Guide Notice if displayed', async function () {
		const buttonSelector = 'button:text("Got it")';
		const hideWelcomePopup = async (): Promise< void > => {
			try {
				const button = await page.waitForSelector( buttonSelector );
				await button.click();
				// Retry if the button doesn't get hidden after 1 second. It can
				// sometimes happen when clicked too early.
				await button.waitForElementState( 'hidden', { timeout: 1000 } );
			} catch {
				return hideWelcomePopup();
			}
		};

		// Hide the Welcome popup if it's present before the network gets idle.
		await Promise.race( [ page.waitForLoadState( 'networkidle' ), hideWelcomePopup() ] );

		// In case the network finished first, look for the button and click if found.
		const button = await page.$( buttonSelector );
		if ( button ) {
			await hideWelcomePopup();
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
