/* eslint-disable import/order */
import { type Mock, vi } from 'vitest';
vi.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
vi.mock( '@wordpress/data', () => ( {
	dispatch: vi.fn(),
	select: vi.fn(),
} ) );

import { select } from '@wordpress/data';
import { hasSiteLogoBlock } from '../site-logo';

describe( 'hasSiteLogoBlock', () => {
	it.each( [
		[ 'no Site Logo block', 0, false ],
		[ 'one Site Logo block', 1, true ],
		[ 'several Site Logo blocks', 3, true ],
	] )( 'reads %s as %s', ( _case, count, expected ) => {
		( select as Mock ).mockReturnValue( { getGlobalBlockCount: () => count } );

		expect( hasSiteLogoBlock() ).toBe( expected );
	} );

	it( 'reads an unreadable block editor store as undefined', () => {
		( select as Mock ).mockReturnValue( undefined );

		expect( hasSiteLogoBlock() ).toBeUndefined();
	} );
} );
