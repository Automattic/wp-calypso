import { HELP_CONTACT_FORM_SITE_SELECT } from 'calypso/state/action-types';
import { selectedSiteId } from '../reducer';

describe( 'reducer', () => {
	describe( '#selectedSiteId()', () => {
		test( 'should default to null', () => {
			const state = selectedSiteId( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should store the site id received', () => {
			const state = selectedSiteId(
				{},
				{
					type: HELP_CONTACT_FORM_SITE_SELECT,
					siteId: 1,
				}
			);

			expect( state ).toEqual( 1 );
		} );
	} );
} );
