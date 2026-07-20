import {
	DataHelper,
	ReaderPage,
	TestAccount,
	TestAccountName,
	envVariables,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Reader: View' ),
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_REMOTE_SITE ] },
	() => {
		const accountName: TestAccountName =
			envVariables.JETPACK_TARGET === 'remote-site' ? 'jetpackRemoteSiteUser' : 'commentingUser';

		test( 'As a user, I can view the Reader', async ( { page } ) => {
			await test.step( 'Authenticate', async () => {
				const testAccount = new TestAccount( accountName );
				// No `waitForStability` needed because we will immediately navigate after authenticating.
				await testAccount.authenticate( page, { waitUntilStable: false } );
			} );

			await test.step( 'Visit the Reader', async () => {
				const readerPage = new ReaderPage( page );
				await readerPage.visit();
			} );

			await test.step( 'Reader stream is present', async () => {
				await Promise.any( [
					page.getByRole( 'link', { name: 'Find sites to follow' } ),
					page.getByRole( 'main' ).getByRole( 'article' ),
				] );
			} );
		} );
	}
);
