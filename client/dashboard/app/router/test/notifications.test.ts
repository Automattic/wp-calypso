import { isInboxCategory, isNoteId } from '../notifications-segments';

describe( 'inbox url segments', () => {
	it( 'reads a numeric segment as a note id', () => {
		expect( isNoteId( '123' ) ).toBe( true );
		expect( isNoteId( '0' ) ).toBe( true );
	} );

	it( 'does not read a category as a note id', () => {
		for ( const category of [ 'unread', 'comments', 'subscribers', 'likes' ] ) {
			expect( isNoteId( category ) ).toBe( false );
			expect( isInboxCategory( category ) ).toBe( true );
		}
	} );

	it( 'rejects segments that only look numeric', () => {
		for ( const segment of [ '12a', 'a12', '1.2', '-1', '', ' 12' ] ) {
			expect( isNoteId( segment ) ).toBe( false );
		}
	} );

	it( 'rejects unknown categories', () => {
		expect( isInboxCategory( 'spam' ) ).toBe( false );
		expect( isInboxCategory( '123' ) ).toBe( false );
	} );
} );
