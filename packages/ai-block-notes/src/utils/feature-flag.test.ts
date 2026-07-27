/**
 * Smoke tests for feature-flag utility
 */

import { isAiBlockNotesEnabled } from './feature-flag';

describe( 'isAiBlockNotesEnabled', () => {
	afterEach( () => {
		delete ( window as any ).aiBlockNotesData;
		delete ( window as any ).blockNotesData;
	} );

	it( 'returns false when no config global is set', () => {
		expect( isAiBlockNotesEnabled() ).toBe( false );
	} );

	it( 'returns true when aiBlockNotesData.enabled is true', () => {
		( window as any ).aiBlockNotesData = { enabled: true };
		expect( isAiBlockNotesEnabled() ).toBe( true );
	} );

	it( 'returns false when aiBlockNotesData.enabled is false', () => {
		( window as any ).aiBlockNotesData = { enabled: false };
		expect( isAiBlockNotesEnabled() ).toBe( false );
	} );

	it( 'reads legacy blockNotesData from older Jetpack versions', () => {
		( window as any ).blockNotesData = { enabled: true };
		expect( isAiBlockNotesEnabled() ).toBe( true );
	} );

	it( 'prefers canonical config when both globals exist', () => {
		( window as any ).aiBlockNotesData = { enabled: false };
		( window as any ).blockNotesData = { enabled: true };
		expect( isAiBlockNotesEnabled() ).toBe( false );
	} );
} );
