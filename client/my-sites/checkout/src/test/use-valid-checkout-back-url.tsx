/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSelector } from 'calypso/state';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { getSiteId, isCommerceGardenSite, isJetpackSite } from 'calypso/state/sites/selectors';
import useValidCheckoutBackUrl from '../hooks/use-valid-checkout-back-url';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/get-initial-query-arguments' );
jest.mock( 'calypso/state/sites/selectors' );

describe( 'useValidCheckoutBackUrl', () => {
	const mockState = {};

	beforeEach( () => {
		jest.clearAllMocks();
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => selector( mockState ) );
		( getInitialQueryArguments as jest.Mock ).mockReturnValue( { checkoutBackUrl: undefined } );
		( getSiteId as jest.Mock ).mockReturnValue( undefined );
		( isJetpackSite as jest.Mock ).mockReturnValue( true );
		( isCommerceGardenSite as jest.Mock ).mockReturnValue( false );
	} );

	it( 'returns a jetpack pricing back url for non-commerce jetpack sites', () => {
		const siteSlug = 'example-site.com';
		const siteId = 654;
		( getSiteId as jest.Mock ).mockReturnValue( siteId );

		const { result } = renderHook( () => useValidCheckoutBackUrl( siteSlug ) );

		expect( isCommerceGardenSite ).toHaveBeenCalledWith( mockState, siteId );
		expect( result.current ).toBe( `https://cloud.jetpack.com/pricing/${ siteSlug }` );
	} );
} );
