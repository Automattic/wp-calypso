import {
	DataHelper,
	ReaderPage,
	TestAccount,
	TestAccountName,
	envVariables,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Reader: View' ),
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_REMOTE_SITE ] },
	() => {
		const accountName: TestAccountName =
			envVariables.JETPACK_TARGET === 'remote-site' ? 'jetpackRemoteSiteUser' : 'commentingUser';

		test( 'As a user, I can view the Reader', async ( { page } ) => {
			await test.step( 'Authenticate', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'Visit the Reader', async () => {
				// Reader onboarding opens over the stream, at any point while the Reader loads,
				// until the account has dismissed it once.
				const dismissOnboarding = page
					.getByRole( 'dialog' )
					.getByRole( 'button', { name: 'Do it later' } );
				await page.addLocatorHandler( dismissOnboarding, () => dismissOnboarding.click() );

				const readerPage = new ReaderPage( page );
				await readerPage.visit();
			} );

			await test.step( 'Reader stream is present', async () => {
				// Loading placeholders are articles too, but their titles aren't links.
				const post = page
					.getByRole( 'main' )
					.getByRole( 'article' )
					.getByRole( 'heading' )
					.getByRole( 'link' );
				await expect(
					page.getByRole( 'link', { name: 'Find sites to follow' } ).or( post ).first()
				).toBeVisible();
			} );
		} );
	}
);
