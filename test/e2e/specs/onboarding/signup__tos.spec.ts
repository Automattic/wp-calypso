import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com TOS' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		test( 'The Terms of Service are visible on the signup page', async ( { page } ) => {
			await page.goto( DataHelper.getCalypsoURL( '/setup/onboarding' ) );

			await expect(
				page.getByText(
					// WARNING! Please contact the legal team if this text changes!
					'By continuing with any of the options listed, you agree to our Terms of Service and have read our Privacy Policy.'
				)
			).toBeVisible();
		} );
	}
);
