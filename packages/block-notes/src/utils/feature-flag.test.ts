/**
 * Smoke tests for feature-flag utility
 */

import { areBlockNotesEnabled } from './feature-flag';

describe( 'areBlockNotesEnabled', () => {
	afterEach( () => {
		delete ( window as any ).blockNotesData;
	} );

	it( 'returns false when blockNotesData is not set', () => {
		expect( areBlockNotesEnabled() ).toBe( false );
	} );

	it( 'returns true when blockNotesData.enabled is true', () => {
		( window as any ).blockNotesData = { enabled: true };
		expect( areBlockNotesEnabled() ).toBe( true );
	} );

	it( 'returns false when blockNotesData.enabled is false', () => {
		( window as any ).blockNotesData = { enabled: false };
		expect( areBlockNotesEnabled() ).toBe( false );
	} );
} );
