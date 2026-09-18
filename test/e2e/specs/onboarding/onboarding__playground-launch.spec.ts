import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Onboarding: Launch a Playground site' ),
	{ tag: [ tags.CALYPSO_PR, tags.DESKTOP_ONLY ] },
	() => {
		test( 'As a visitor, I can launch my Playground site into onboarding', async ( {
			page,
			pageUserSignUp,
		} ) => {
			test.setTimeout( 180 * 1000 );
			let playgroundId: string;

			await test.step( 'When I open the Playground onboarding flow', async () => {
				await page.goto( DataHelper.getCalypsoURL( '/setup/onboarding/playground' ) );
			} );

			await test.step( 'Then a persisted Playground is ready to launch', async () => {
				const launchButton = page.getByRole( 'button', { name: 'Launch on WordPress.com' } );
				await expect( launchButton ).toBeEnabled( { timeout: 120 * 1000 } );

				const generatedPlaygroundId = new URL( page.url() ).searchParams.get( 'playground' );
				expect( generatedPlaygroundId ).toBeTruthy();
				playgroundId = generatedPlaygroundId as string;
			} );

			await test.step( 'When I launch the Playground site on WordPress.com', async () => {
				await Promise.all( [
					page.waitForURL(
						( url ) =>
							url.pathname.endsWith( '/setup/onboarding/user' ) &&
							url.searchParams.get( 'playground' ) === playgroundId,
						{ timeout: 30 * 1000 }
					),
					page.getByRole( 'button', { name: 'Launch on WordPress.com' } ).click(),
				] );
			} );

			await test.step( 'Then I am asked to create or connect my account', async () => {
				const signupEntry = pageUserSignUp.createYourAccountHeading
					.or( page.getByRole( 'button', { name: 'Continue with email' } ) )
					.or( pageUserSignUp.emailInput )
					.first();
				await expect( signupEntry ).toBeVisible();
			} );
		} );
	}
);
