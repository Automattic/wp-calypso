import { isSupportNextSession, isSupportSession, isSupportSessionProxy } from '../index';

describe( 'support session detection', () => {
	afterEach( () => {
		delete window.isSupportSession;
		delete window.isSSP;
	} );

	test( 'reports no session when neither global is set', () => {
		expect( isSupportNextSession() ).toBe( false );
		expect( isSupportSessionProxy() ).toBe( false );
		expect( isSupportSession() ).toBe( false );
	} );

	test( 'detects the support session global', () => {
		window.isSupportSession = true;
		expect( isSupportNextSession() ).toBe( true );
		expect( isSupportSessionProxy() ).toBe( false );
		expect( isSupportSession() ).toBe( true );
	} );

	test( 'detects the support session proxy global', () => {
		window.isSSP = true;
		expect( isSupportSessionProxy() ).toBe( true );
		expect( isSupportSession() ).toBe( true );
	} );

	test( 'does not infer one flag from the other', () => {
		window.isSSP = true;
		expect( isSupportNextSession() ).toBe( false );

		delete window.isSSP;
		window.isSupportSession = true;
		expect( isSupportSessionProxy() ).toBe( false );
	} );
} );
