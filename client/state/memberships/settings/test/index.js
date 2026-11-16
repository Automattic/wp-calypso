import { MEMBERSHIPS_SETTINGS_RECEIVE } from 'calypso/state/action-types';
import reducer from '../reducer';
import { getConnectedAccountAcceptsChargesForSiteId } from '../selectors';

const siteId = 123;

const receive = ( data ) => ( {
	memberships: { settings: reducer( {}, { type: MEMBERSHIPS_SETTINGS_RECEIVE, siteId, data } ) },
} );

describe( 'getConnectedAccountAcceptsChargesForSiteId', () => {
	test( 'returns false when the account does not accept charges', () => {
		const state = receive( { connected_account_accepts_charges: false } );
		expect( getConnectedAccountAcceptsChargesForSiteId( state, siteId ) ).toBe( false );
	} );

	test( 'returns true when the account accepts charges', () => {
		const state = receive( { connected_account_accepts_charges: true } );
		expect( getConnectedAccountAcceptsChargesForSiteId( state, siteId ) ).toBe( true );
	} );

	test( 'returns true when the field is missing', () => {
		expect( getConnectedAccountAcceptsChargesForSiteId( receive( {} ), siteId ) ).toBe( true );
		expect( getConnectedAccountAcceptsChargesForSiteId( {}, siteId ) ).toBe( true );
	} );
} );
