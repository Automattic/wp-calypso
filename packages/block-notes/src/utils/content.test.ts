/**
 * Unit tests for Block Notes content utilities
 *
 * These tests validate the @ai mention detection and splitting functions
 * used across block notes components.
 */

import { hasAiMention, splitByAiMention } from './content';

describe( 'Block Notes Content Utilities', () => {
	describe( 'hasAiMention', () => {
		it( 'should return true for text with @ai mention', () => {
			expect( hasAiMention( '@ai help' ) ).toBe( true );
		} );

		it( 'should return false for null, undefined, or empty', () => {
			expect( hasAiMention( null ) ).toBe( false );
			expect( hasAiMention( undefined ) ).toBe( false );
			expect( hasAiMention( '' ) ).toBe( false );
		} );

		it( 'should require word boundary after @ai', () => {
			expect( hasAiMention( '@aid' ) ).toBe( false );
		} );

		it( 'should handle @ai with punctuation', () => {
			expect( hasAiMention( '@ai! help' ) ).toBe( true );
		} );
	} );

	describe( 'splitByAiMention', () => {
		it( 'should split text and preserve @ai mentions', () => {
			expect( splitByAiMention( 'Hello @ai help' ) ).toEqual( [ 'Hello ', '@ai', ' help' ] );
		} );

		it( 'should handle text without @ai', () => {
			expect( splitByAiMention( '' ) ).toEqual( [ '' ] );
			expect( splitByAiMention( 'Just regular text' ) ).toEqual( [ 'Just regular text' ] );
		} );
	} );
} );
