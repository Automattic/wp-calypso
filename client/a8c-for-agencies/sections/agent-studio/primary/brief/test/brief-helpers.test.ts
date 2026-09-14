import { getBriefExcerpt } from '../brief-helpers';

describe( 'getBriefExcerpt', () => {
	it( 'collapses whitespace into a single line', () => {
		expect( getBriefExcerpt( '  Launch   plan\n\nfor   the   client  ' ) ).toBe(
			'Launch plan for the client'
		);
	} );

	it( 'returns short text unchanged', () => {
		expect( getBriefExcerpt( 'A short brief.' ) ).toBe( 'A short brief.' );
	} );

	it( 'truncates long text with an ellipsis', () => {
		const excerpt = getBriefExcerpt( 'word '.repeat( 80 ) );

		expect( excerpt.endsWith( '…' ) ).toBe( true );
		expect( excerpt.length ).toBeLessThanOrEqual( 141 );
	} );
} );
