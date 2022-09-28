/**
 * @jest-environment jsdom
 */
import { getLaunchpadTranslations } from '../translations';

describe( 'Translations', () => {
	describe( 'getLaunchpadTranslations', () => {
		describe( 'when using a tailored onboarding flow', () => {
			it( 'provides flow specific text', () => {
				const newsletterTranslations = getLaunchpadTranslations( 'newsletter' );
				expect( newsletterTranslations.flowName ).toEqual( 'Newsletter' );
				expect( newsletterTranslations.title ).toEqual( 'Your Newsletter is ready!' );
				expect( newsletterTranslations.launchTitle ).toBe( undefined );

				const linkInBioTranslations = getLaunchpadTranslations( 'link-in-bio' );
				expect( linkInBioTranslations.flowName ).toEqual( 'Link in Bio' );
				expect( linkInBioTranslations.title ).toEqual( 'Your Link in Bio is almost ready!' );
				expect( linkInBioTranslations.launchTitle ).toEqual(
					'Your Link in Bio is ready to launch!'
				);
			} );
		} );

		describe( 'when no flow is specified', () => {
			it( 'provides generic text', () => {
				const translations = getLaunchpadTranslations( null );
				expect( translations.flowName ).toEqual( 'WordPress' );
				expect( translations.title ).toEqual( 'Your website is ready!' );
				expect( translations.subtitle ).toEqual( 'Keep up the momentum with these final steps.' );
			} );
		} );
	} );
} );
