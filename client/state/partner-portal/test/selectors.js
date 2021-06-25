/**
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import * as selectors from 'calypso/state/partner-portal/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

jest.mock( 'calypso/state/selectors/get-current-route', () => jest.fn() );

describe( 'selectors', () => {
	describe( '#isPartnerPortal()', () => {
		test( 'should return true for URLs starting with /partner-portal', () => {
			const { isPartnerPortal } = selectors;

			getCurrentRoute.mockReturnValueOnce( '' );
			expect( isPartnerPortal( {} ) ).toEqual( false );

			getCurrentRoute.mockReturnValueOnce( '/partner' );
			expect( isPartnerPortal( {} ) ).toEqual( false );

			getCurrentRoute.mockReturnValueOnce( '/partner-portal' );
			expect( isPartnerPortal( {} ) ).toEqual( true );

			getCurrentRoute.mockReturnValueOnce( '/partner-portals' );
			expect( isPartnerPortal( {} ) ).toEqual( true );

			getCurrentRoute.mockReturnValueOnce( '/partner-portal/foo' );
			expect( isPartnerPortal( {} ) ).toEqual( true );
		} );
	} );
} );
