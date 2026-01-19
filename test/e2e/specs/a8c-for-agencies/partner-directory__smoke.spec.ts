import { PartnerDirectoryComponent } from '@automattic/calypso-e2e';
import { test, tags } from '../../lib/pw-base';

/**
 * Verify the Partner Directory page loads and is interactive.
 */
test.describe(
	'Automattic For Agencies: Partner Directory',
	{ tag: [ tags.A8C_FOR_AGENCIES, tags.GUTENBERG ] },
	() => {
		test( 'As a user, I can filter partners and view a partner details page', async ( {
			environment,
			page,
		} ) => {
			const partnerDirectory = new PartnerDirectoryComponent( page );

			await test.step( 'Given I navigate to the Partner Directory', async () => {
				await page.goto( environment.PARTNER_DIRECTORY_BASE_URL );
			} );

			await test.step( 'When I apply the Legal & Professional Services industry filter', async () => {
				await partnerDirectory.applyDropdownFilter( 'Industries', 'Legal & Professional Services' );
			} );

			await test.step( 'Then I see the filter has been applied', async () => {
				await partnerDirectory.waitForFilterToBeApplied();
			} );

			await test.step( "And I can visit the first partner's details page", async () => {
				await Promise.all( [
					page.waitForURL(
						new RegExp( `^${ environment.PARTNER_DIRECTORY_BASE_URL }/[^/]+/[^/]+/` ),
						{
							timeout: 10_000,
						}
					),
					partnerDirectory.clickFirstPartner(),
				] );
			} );
		} );
	}
);
