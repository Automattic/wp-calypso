/**
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import * as selectors from 'calypso/state/partner-portal/partner/selectors';

describe( 'selectors', () => {
	describe( '#getActivePartnerKeyId()', () => {
		test( 'should return the value of activePartnerKey', () => {
			const { getActivePartnerKeyId } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						activePartnerKey: 0,
					},
				},
			};

			expect( getActivePartnerKeyId( state ) ).toEqual(
				state.partnerPortal.partner.activePartnerKey
			);

			state.partnerPortal.partner.activePartnerKey = 1;
			expect( getActivePartnerKeyId( state ) ).toEqual(
				state.partnerPortal.partner.activePartnerKey
			);
		} );
	} );

	describe( '#getActivePartnerKey()', () => {
		test( 'should return null if there is no current partner', () => {
			const { getActivePartnerKey } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						current: null,
						activePartnerKey: 0,
					},
				},
			};

			expect( getActivePartnerKey( state ) ).toEqual( null );

			// Make sure an invalid state does not return an incorrect value.
			state.partnerPortal.partner.activePartnerKey = 1;
			expect( getActivePartnerKey( state ) ).toEqual( null );
		} );

		test( 'should return null if there is a partner but the active key is invalid', () => {
			const { getActivePartnerKey } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						current: { keys: [] },
						activePartnerKey: 1,
					},
				},
			};

			expect( getActivePartnerKey( state ) ).toEqual( null );
		} );

		test( 'should return the currently active key', () => {
			const { getActivePartnerKey } = selectors;
			const key = { id: 1 };
			const state = {
				partnerPortal: {
					partner: {
						current: { keys: [ key ] },
						activePartnerKey: 1,
					},
				},
			};

			expect( getActivePartnerKey( state ) ).toEqual( key );
		} );
	} );

	describe( '#hasActivePartnerKey()', () => {
		test( 'should return false if there is no current partner', () => {
			const { hasActivePartnerKey } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						current: null,
						activePartnerKey: 0,
					},
				},
			};

			expect( hasActivePartnerKey( state ) ).toEqual( false );

			// Make sure an invalid state does not return an incorrect value.
			state.partnerPortal.partner.activePartnerKey = 1;
			expect( hasActivePartnerKey( state ) ).toEqual( false );
		} );

		test( 'should return false if there is a partner but the active key is invalid', () => {
			const { hasActivePartnerKey } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						current: { keys: [] },
						activePartnerKey: 1,
					},
				},
			};

			expect( hasActivePartnerKey( state ) ).toEqual( false );
		} );

		test( 'should return true if there is a valid active key', () => {
			const { hasActivePartnerKey } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						current: { keys: [ { id: 1 } ] },
						activePartnerKey: 1,
					},
				},
			};

			expect( hasActivePartnerKey( state ) ).toEqual( true );
		} );
	} );

	describe( '#hasFetchedPartner()', () => {
		test( 'should return the value of hasFetched', () => {
			const { hasFetchedPartner } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						hasFetched: false,
					},
				},
			};

			expect( hasFetchedPartner( state ) ).toEqual( state.partnerPortal.partner.hasFetched );

			state.partnerPortal.partner.hasFetched = true;
			expect( hasFetchedPartner( state ) ).toEqual( state.partnerPortal.partner.hasFetched );
		} );
	} );

	describe( '#isFetchingPartner()', () => {
		test( 'should return the value of isFetching', () => {
			const { isFetchingPartner } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						isFetching: false,
					},
				},
			};

			expect( isFetchingPartner( state ) ).toEqual( state.partnerPortal.partner.isFetching );

			state.partnerPortal.partner.isFetching = true;
			expect( isFetchingPartner( state ) ).toEqual( state.partnerPortal.partner.isFetching );
		} );
	} );

	describe( '#getCurrentPartner()', () => {
		test( 'should return the value of getCurrentPartner', () => {
			const { getCurrentPartner } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						current: null,
					},
				},
			};

			expect( getCurrentPartner( state ) ).toEqual( state.partnerPortal.partner.current );

			state.partnerPortal.partner.current = { keys: [] };
			expect( getCurrentPartner( state ) ).toEqual( state.partnerPortal.partner.current );
		} );
	} );

	describe( '#getPartnerRequestError()', () => {
		test( 'should return the value of error', () => {
			const { getPartnerRequestError } = selectors;
			const state = {
				partnerPortal: {
					partner: {
						error: '',
					},
				},
			};

			expect( getPartnerRequestError( state ) ).toEqual( state.partnerPortal.partner.error );

			state.partnerPortal.partner.error = 'Foo';
			expect( getPartnerRequestError( state ) ).toEqual( state.partnerPortal.partner.error );
		} );
	} );
} );
