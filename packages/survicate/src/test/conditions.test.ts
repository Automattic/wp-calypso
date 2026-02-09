import { shouldLoadSurvicate, SURVICATE_WORKSPACE_ID } from '../conditions';

describe( 'SURVICATE_WORKSPACE_ID', () => {
	test( 'should be the expected workspace ID', () => {
		expect( SURVICATE_WORKSPACE_ID ).toBe( 'e4794374cce15378101b63de24117572' );
	} );
} );

describe( 'shouldLoadSurvicate', () => {
	test( 'should return true for English locale on desktop', () => {
		expect( shouldLoadSurvicate( { locale: 'en', isMobile: false } ) ).toBe( true );
	} );

	test( 'should return true for English language variants', () => {
		expect( shouldLoadSurvicate( { locale: 'en-US', isMobile: false } ) ).toBe( true );
		expect( shouldLoadSurvicate( { locale: 'en-GB', isMobile: false } ) ).toBe( true );
	} );

	test( 'should return false for non-English locales', () => {
		expect( shouldLoadSurvicate( { locale: 'fr', isMobile: false } ) ).toBe( false );
		expect( shouldLoadSurvicate( { locale: 'es-ES', isMobile: false } ) ).toBe( false );
		expect( shouldLoadSurvicate( { locale: 'pt-br', isMobile: false } ) ).toBe( false );
	} );

	test( 'should return false on mobile devices', () => {
		expect( shouldLoadSurvicate( { locale: 'en', isMobile: true } ) ).toBe( false );
	} );

	test( 'should return false for non-English on mobile', () => {
		expect( shouldLoadSurvicate( { locale: 'fr', isMobile: true } ) ).toBe( false );
	} );
} );
