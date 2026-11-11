import apiFetch from '@wordpress/api-fetch';
import { fetchWooHandoff } from '../use-woo-handoff';
import type { WooHandoffData } from '../../human-routing/woo-handoff';

jest.mock( '@wordpress/api-fetch' );

const mockApiFetch = apiFetch as jest.MockedFunction< typeof apiFetch >;

const merchant: WooHandoffData = {
	supportTier: 'tier_1',
	isPaying: true,
	isWooEnterpriseCustomer: false,
	connectedStores: [],
	supportedProducts: [],
	isVendor: false,
};

// apiFetch rejects with the REST error body, which has the HTTP status in `data`.
const restError = ( status: number ) => ( { code: 'rest_error', data: { status } } );

describe( 'fetchWooHandoff', () => {
	it( "fetches the signed-in merchant's details from WooCommerce.com", async () => {
		mockApiFetch.mockResolvedValue( merchant );

		await expect( fetchWooHandoff() ).resolves.toEqual( { merchant, isSupportBlocked: false } );
		expect( mockApiFetch ).toHaveBeenCalledWith( { path: '/wccom/help-center/v1/handoff' } );
	} );

	it( 'knows when WooCommerce.com turns the merchant away from support', async () => {
		mockApiFetch.mockRejectedValue( restError( 403 ) );

		await expect( fetchWooHandoff() ).resolves.toEqual( {
			merchant: null,
			isSupportBlocked: true,
		} );
	} );

	it.each( [
		[ 'signed out', restError( 401 ) ],
		[ 'without the route', restError( 404 ) ],
		[ 'on a network error', { code: 'fetch_error' } ],
	] )( 'leaves the details out %s', async ( _name, error ) => {
		mockApiFetch.mockRejectedValue( error );

		await expect( fetchWooHandoff() ).resolves.toEqual( {
			merchant: null,
			isSupportBlocked: false,
		} );
	} );
} );
