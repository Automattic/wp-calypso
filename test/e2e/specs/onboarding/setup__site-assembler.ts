/**
 * @group calypso-release
 */

import {
	DataHelper,
	SecretsManager,
	TestAccount,
	SiteAssemblerFlow,
} from '@automattic/calypso-e2e';
import { Browser, FrameLocator, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Site Assembler' ), () => {
	const credentials = SecretsManager.secrets.testAccounts.defaultUser;
	const siteSlug = credentials.testSites?.primary?.url as string;
	const selectors = {
		patternLargePreviewIframe: '.pattern-large-preview iframe',
		wpSiteBlocksHeader: '.wp-site-blocks > [data-type="header"]',
		wpSiteBlocksFooter: '.wp-site-blocks > [data-type="footer"]',
	};

	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Create a site with the Site Assembler', function () {
		let assembledPreviewLocator: FrameLocator;
		let startSiteFlow: SiteAssemblerFlow;

		beforeAll( async function () {
			startSiteFlow = new SiteAssemblerFlow( page );
		} );

		it( 'Enter Onboarding flow', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/setup/site-setup', { siteSlug } ), {
				timeout: 30 * 1000,
			} );
		} );

		it( 'Skip until the Design Picker', async function () {
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

			assembledPreviewLocator = page.frameLocator( selectors.patternLargePreviewIframe );
		} );

		it( 'Select "Header"', async function () {
			await startSiteFlow.selectLayoutComponentType( 'Header' );
			await startSiteFlow.selectLayoutComponent( 1 );

			expect( await assembledPreviewLocator.locator( selectors.wpSiteBlocksHeader ).count() ).toBe(
				1
			);

			await startSiteFlow.clickButton( 'Save' );
		} );

		it( 'Select "Footer"', async function () {
			await startSiteFlow.selectLayoutComponentType( 'Footer' );
			await startSiteFlow.selectLayoutComponent( 1 );

			expect( await assembledPreviewLocator.locator( selectors.wpSiteBlocksFooter ).count() ).toBe(
				1
			);

			await startSiteFlow.clickButton( 'Save' );
		} );

		it( 'Click "Continue" and land on the Site Editor', async function () {
			await Promise.all( [
				page.waitForURL( /processing/ ),
				startSiteFlow.clickButton( 'Continue' ),
			] );
			await page.waitForURL( /site-editor/, {
				timeout: 45 * 1000,
			} );
		} );
	} );
} );
