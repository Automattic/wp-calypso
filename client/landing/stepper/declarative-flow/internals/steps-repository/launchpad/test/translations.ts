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
				expect( newsletterTranslations.title ).toEqual( "You're all set to start publishing" );
				expect( newsletterTranslations.launchTitle ).toBe( undefined );

				const linkInBioTranslations = getLaunchpadTranslations( 'link-in-bio' );
				expect( linkInBioTranslations.flowName ).toEqual( 'Link in Bio' );
				expect( linkInBioTranslations.title ).toEqual( "You're ready to link and launch" );
				expect( linkInBioTranslations.launchTitle ).toEqual( "You're ready to link and launch" );

				const freeFlowTranslations = getLaunchpadTranslations( 'free' );
				expect( freeFlowTranslations.flowName ).toEqual( 'Free Website' );
				expect( freeFlowTranslations.title ).toEqual( "Your new site's ready!" );
				expect( freeFlowTranslations.launchTitle ).toEqual( "Your new site's ready!" );
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
