jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn(),
	select: jest.fn(),
} ) );

import { select } from '@wordpress/data';
import { hasSiteLogoBlock } from '../site-logo';

describe( 'hasSiteLogoBlock', () => {
	it.each( [
		[ 'no Site Logo block', 0, false ],
		[ 'one Site Logo block', 1, true ],
		[ 'several Site Logo blocks', 3, true ],
	] )( 'reads %s as %s', ( _case, count, expected ) => {
		( select as jest.Mock ).mockReturnValue( { getGlobalBlockCount: () => count } );

		expect( hasSiteLogoBlock() ).toBe( expected );
	} );

	it( 'reads an unreadable block editor store as undefined', () => {
		( select as jest.Mock ).mockReturnValue( undefined );

		expect( hasSiteLogoBlock() ).toBeUndefined();
	} );
} );
