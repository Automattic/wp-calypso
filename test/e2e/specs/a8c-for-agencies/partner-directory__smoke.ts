/**
 * @group gutenberg
 */

import { envVariables, PartnerDirectoryComponent } from '@automattic/calypso-e2e';
import type { Browser, Page } from 'playwright';
declare const browser: Browser;

/**
 * Verify the Partner Directory page loads and is interactive.
 */
describe( 'Automattic For Agencies: Partner Directory', () => {
	let page: Page;
	let partnerDirectory: PartnerDirectoryComponent;

	beforeAll( async () => {
		page = await browser.newPage();
		partnerDirectory = new PartnerDirectoryComponent( page );
	} );

	test( 'Navigate to the Partner Directory', async () => {
		await page.goto( envVariables.PARTNER_DIRECTORY_BASE_URL );
	} );

	test( 'Apply the Legal & Professional Services industry filter', async () => {
		await partnerDirectory.applyDropdownFilter( 'Industries', 'Legal & Professional Services' );
	} );

	test( 'Wait for the filter to be applied', async () => {
		await partnerDirectory.waitForFilterToBeApplied();
	} );

	test( "Visit the first partner's details page", async () => {
		await Promise.all( [
			page.waitForURL( new RegExp( `^${ envVariables.PARTNER_DIRECTORY_BASE_URL }/[^/]+/[^/]+/` ), {
				timeout: 10_000,
			} ),
			partnerDirectory.clickFirstPartner(),
		] );
	} );
} );
