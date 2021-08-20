import { expect } from 'chai';
import { HELP_CONTACT_FORM_SITE_SELECT } from 'calypso/state/action-types';
import { selectSiteId } from '../actions';

describe( 'actions', () => {
	describe( '#selectSiteId()', () => {
		test( 'should return an action object', () => {
			const action = selectSiteId( 1 );

			expect( action ).to.eql( {
				type: HELP_CONTACT_FORM_SITE_SELECT,
				siteId: 1,
			} );
		} );
	} );
} );
