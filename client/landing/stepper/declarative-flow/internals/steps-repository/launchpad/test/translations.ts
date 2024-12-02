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
				expect( newsletterTranslations.title ).toEqual( "Your newsletter's ready!" );
				expect( newsletterTranslations.launchTitle ).toBe( undefined );
			} );
		} );

		describe( 'when no flow is specified', () => {
			it( 'provides generic text', () => {
				const translations = getLaunchpadTranslations( null );
				expect( translations.flowName ).toEqual( 'WordPress.com' );
				expect( translations.title ).toEqual( 'Your website is ready!' );
				expect( translations.subtitle ).toEqual( 'Keep up the momentum with these final steps.' );
			} );
		} );
	} );
} );
