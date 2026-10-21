import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com TOS' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		test( 'The Terms of Service are visible on the signup page', async ( {
			page,
			viewportName,
		} ) => {
			await page.goto( DataHelper.getCalypsoURL( '/setup/onboarding' ) );

			// Mobile renders the compact signup layout with "…options above…" copy;
			// desktop uses "…options listed…". Both are legal-approved.
			// WARNING! Please contact the legal team if either string changes!
			const tosText =
				viewportName === 'mobile'
					? 'By continuing with any of the options above, you agree to our Terms of Service and have read our Privacy Policy.'
					: 'By continuing with any of the options listed, you agree to our Terms of Service and have read our Privacy Policy.';

			await expect( page.getByText( tosText ) ).toBeVisible();
		} );
	}
);
