/**
 * Internal dependencies
 */
import { decodeEntities } from '../entities';

describe( 'decodeEntities', () => {
	it( 'should not change html with no entities', () => {
		const html = '<h1>A noble tag embiggens the smallest text.</h1>';
		const expected = '<h1>A noble tag embiggens the smallest text.</h1>';
		expect( decodeEntities( html ) ).toEqual( expected );
	} );
	it( 'should decode entities', () => {
		const html = '&lt;h1&gt;This post&#8217;s title.&lt;/h1&gt;';
		const expected = '<h1>This post’s title.</h1>';
		expect( decodeEntities( html ) ).toEqual( expected );
	} );
	it( 'should not double decode entities', () => {
		const html = 'This post&amp;rsquo;s title.';
		const expected = 'This post&rsquo;s title.';
		expect( decodeEntities( html ) ).toEqual( expected );
	} );
} );
