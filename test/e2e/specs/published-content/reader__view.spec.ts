import { ReaderPage, TestAccountName, envVariables, TestAccount } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Tests the Reader view functionality.
 *
 * Keywords: Reader, Jetpack
 */
test.describe( 'Reader: View', { tag: [ tags.CALYPSO_PR, tags.JETPACK_REMOTE_SITE ] }, () => {
	let readerPage: ReaderPage;

	test( 'View Reader stream', async ( { page } ) => {
		const accountName: TestAccountName =
			envVariables.JETPACK_TARGET === 'remote-site' ? 'jetpackRemoteSiteUser' : 'commentingUser';

		await test.step( `Given I am authenticated as '${ accountName }'`, async function () {
			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		await test.step( 'When I visit the Reader', async function () {
			readerPage = new ReaderPage( page );
			await readerPage.visit();
		} );

		await test.step( 'Then I see the Reader page', async function () {
			await expect( page ).toHaveURL( /read/ );
		} );

		await test.step( 'And the Reader stream is present', async function () {
			await expect( page.locator( 'main article' ).first() ).toBeVisible();
		} );
	} );
} );
