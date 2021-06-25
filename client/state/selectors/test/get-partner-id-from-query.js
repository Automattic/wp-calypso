/**
 * Internal dependencies
 */
import getPartnerIdFromQuery from 'calypso/state/selectors/get-partner-id-from-query';

describe( '#getPartnerIdFromQuery', () => {
	test( 'should return null when no argument', () => {
		expect( getPartnerIdFromQuery() ).toBeNull();
	} );

	test( 'should return null if no partner_id query present', () => {
		const state = {
			route: {
				query: {
					current: {
						email_address: 'user@wordpress.com',
					},
				},
			},
		};
		expect( getPartnerIdFromQuery( state ) ).toBeNull();
	} );

	test( 'should return null when partner_id present but not integer', () => {
		const state = {
			route: {
				query: {
					current: {
						email_address: 'user@wordpress.com',
						partner_id: 'meh',
					},
				},
			},
		};

		expect( getPartnerIdFromQuery( state ) ).toBeNull();
	} );

	test( 'should return partner ID as integer when partner_id query present', () => {
		const state = {
			route: {
				query: {
					current: {
						email_address: 'user@wordpress.com',
						partner_id: '49640',
					},
				},
			},
		};

		// toBe is a strict equality check here.
		expect( getPartnerIdFromQuery( state ) ).toBe( 49640 );
	} );
} );
