import filterMessage from '../filterMessage';

describe( 'filterMessage', () => {
	describe( 'when a clean message is passed in', () => {
		it( 'should return the message unfiltered', () => {
			const actual = filterMessage( 'clean message.' );
			expect( actual ).toBe( 'clean message.' );
		} );
	} );

	describe( 'when a message is passed in twice in a row', () => {
		it( 'should add a space to the message to make sure it is announced again', () => {
			filterMessage( 'repeated message.' );
			const actual = filterMessage( 'repeated message.' );
			expect( actual ).toBe( 'repeated message.' + '\u00A0' );
		} );
	} );

	describe( 'when a message contains html tags', () => {
		it( 'should strip the html tags and replace them with spaces', () => {
			const actual = filterMessage( '<p>html paragraph</p>' );
			expect( actual ).toBe( ' html paragraph ' );
		} );
	} );
} );
