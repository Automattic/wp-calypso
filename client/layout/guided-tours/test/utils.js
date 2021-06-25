/**
 * Internal dependencies
 */
import { and } from 'calypso/layout/guided-tours/utils';

describe( 'Guided Tours utilities: and()', () => {
	test( 'returns true when all passed callbacks are truthy', () => {
		const a = () => true;
		const b = () => 1;
		const c = () => 'a string';
		expect( and( a, b, c )() ).toEqual( true );
	} );

	test( 'returns false when one or more callbacks are not truthy', () => {
		const a = () => true;
		const b = () => 0;
		const c = () => 'a string';
		expect( and( a, b, c )() ).toEqual( false );
	} );
} );
