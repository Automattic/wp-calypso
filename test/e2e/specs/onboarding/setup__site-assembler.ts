/**
 * @group calypso-release
 */

import {
	DataHelper,
	SecretsManager,
	TestAccount,
	SiteAssemblerFlow,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Site Assembler' ), () => {
	const credentials = SecretsManager.secrets.testAccounts.defaultUser;
	const siteSlug = credentials.testSites?.primary?.url as string;

	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Create a site with the Site Assembler', function () {
		const assembledPreviewLocator = page.locator(
			'.pattern-large-preview__patterns .block-renderer'
		);
		let startSiteFlow: SiteAssemblerFlow;

		beforeAll( async function () {
			startSiteFlow = new SiteAssemblerFlow( page );
		} );

		it( 'Enter Onboarding flow', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/setup/site-setup', { siteSlug } ), {
				timeout: 30 * 1000,
			} );
		} );

		it( 'Select "Continue" until it lands on the Design Picker', async function () {
			await startSiteFlow.clickButton( 'Continue' );
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Select "Start designing" and land on the Site Assembler', async function () {
			await startSiteFlow.clickButton( 'Start designing' );
			await page.waitForURL(
				DataHelper.getCalypsoURL( `/setup/site-setup/patternAssembler?siteSlug=${ siteSlug }` ),
				{
					timeout: 30 * 1000,
				}
			);
		} );

		it( 'Select "Header"', async function () {
			// await startSiteFlow.selectHeader();
			await startSiteFlow.selectLayoutComponent( 'Header', 1 );
			await startSiteFlow.clickButton( 'Save' );
			expect( await assembledPreviewLocator.count() ).toBe( 1 );
		} );

		it( 'Select "Footer"', async function () {
			// await startSiteFlow.selectFooter();
			await startSiteFlow.selectLayoutComponent( 'Footer', 1 );
			await startSiteFlow.clickButton( 'Save' );
			expect( await assembledPreviewLocator.count() ).toBe( 2 );
		} );

		it( 'Click "Continue" and land on the Site Editor', async function () {
			await page.waitForLoadState( 'networkidle' );
			await startSiteFlow.clickButton( 'Continue' );
			await page.waitForURL( /site-editor/, {
				timeout: 45 * 1000,
			} );
		} );
	} );
} );
