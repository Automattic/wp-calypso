import { A4A_MARKETPLACE_PRESSABLE_RETURN_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { isPathAllowed } from '../permission';
import type { Agency } from 'calypso/state/a8c-for-agencies/types';

it.each( [
	[ [ 'a4a_jetpack_licensing' ], true ],
	[ [ 'a4a_read_marketplace' ], false ],
	[ [], false ],
] )( 'requires purchase access for the Pressable return route: %p', ( capabilities, expected ) => {
	const agency = { user: { capabilities } } as Agency;
	expect( isPathAllowed( A4A_MARKETPLACE_PRESSABLE_RETURN_LINK, agency ) ).toBe( expected );
} );
