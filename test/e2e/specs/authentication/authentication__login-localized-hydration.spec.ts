import { DataHelper } from '@automattic/calypso-e2e';
import { tags, test, expect } from '../../lib/pw-base';

test.describe(
	'Authentication: Login SSR + hydration (localized)',
	{ tag: [ tags.AUTHENTICATION, tags.CALYPSO_RELEASE ] },
	() => {
		test( 'Default locale: headings SSR and controls interactive', async ( { page } ) => {
			await page.goto( DataHelper.getCalypsoURL( 'log-in' ), {
				waitUntil: 'domcontentloaded',
			} );

			const heading = page.locator( 'h1' ).first();
			const initialHeading = ( await heading.textContent() )?.trim() ?? '';
			expect( initialHeading.length ).toBeGreaterThan( 0 );

			const usernameInput = page.getByRole( 'textbox', {
				name: /email address|username/i,
			} );
			await expect( usernameInput ).toBeEnabled( { timeout: 15_000 } );

			const continueButton = page.getByRole( 'button', { name: /^continue$/i } );
			await expect( continueButton ).toBeEnabled( { timeout: 15_000 } );
		} );

		test( 'Dutch locale: headings SSR and controls interactive', async ( { page } ) => {
			await page.goto( DataHelper.getCalypsoURL( 'log-in/nl' ), {
				waitUntil: 'domcontentloaded',
			} );

			const heading = page.locator( 'h1' ).first();
			const initialHeading = ( await heading.textContent() )?.trim() ?? '';
			expect( initialHeading.length ).toBeGreaterThan( 0 );

			const usernameInput = page.getByRole( 'textbox', {
				name: /e-mailadres|gebruikersnaam/i,
			} );
			await expect( usernameInput ).toBeEnabled( { timeout: 15_000 } );

			const continueButton = page.getByRole( 'button', { name: /^doorgaan$/i } );
			await expect( continueButton ).toBeEnabled( { timeout: 15_000 } );
		} );
	}
);
