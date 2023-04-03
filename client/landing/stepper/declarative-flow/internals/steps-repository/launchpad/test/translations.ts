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
				expect( newsletterTranslations.title ).toEqual( "Your newsletter's ready" );
				expect( newsletterTranslations.launchTitle ).toBe( undefined );

				const linkInBioTranslations = getLaunchpadTranslations( 'link-in-bio' );
				expect( linkInBioTranslations.flowName ).toEqual( 'Link in Bio' );
				expect( linkInBioTranslations.title ).toEqual( "You're ready to link and launch" );
				expect( linkInBioTranslations.launchTitle ).toEqual( "You're ready to link and launch" );

				const freeFlowTranslations = getLaunchpadTranslations( 'free' );
				expect( freeFlowTranslations.flowName ).toEqual( 'Free Website' );
				expect( freeFlowTranslations.title ).toEqual( "Let's get ready to launch!" );
				expect( freeFlowTranslations.launchTitle ).toEqual( "Let's get ready to launch!" );
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
