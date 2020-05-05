/**
 */

/**
 * Internal dependencies
 */
import decodeEntities from '../node';

describe( 'decodeEntities', () => {
	test( 'should decode entities', () => {
		const decoded = decodeEntities( 'Ribs &gt; Chicken' );
		expect( decoded ).toBe( 'Ribs > Chicken' );
	} );

	test( 'should not alter already-decoded entities', () => {
		const decoded = decodeEntities( 'Ribs > Chicken. Truth &amp; Liars.' );
		expect( decoded ).toBe( 'Ribs > Chicken. Truth & Liars.' );
	} );
} );
