/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useCanPublishPluginReview } from '../use-can-publish-plugin-reviews';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

describe( 'useCanPublishPluginReview', () => {
	it( 'returns true if the user is logged in and the plugin is not a marketplace product', () => {
		useSelector.mockImplementation( ( selector ) =>
			selector( {
				currentUser: { id: 1 },
				purchases: {},
			} )
		);
		const { result } = renderHook( () =>
			useCanPublishPluginReview( { isMarketplaceProduct: false } )
		);

		expect( result.current ).toBe( true );
	} );

	it( 'returns false if the user is not logged in', () => {
		useSelector.mockImplementation( ( selector ) =>
			selector( {
				currentUser: { id: null },
				purchases: {},
			} )
		);

		const { result } = renderHook( () =>
			useCanPublishPluginReview( { isMarketplaceProduct: false } )
		);

		expect( result.current ).toBe( false );
	} );

	it( 'returns true if the user is logged in and has an active subscription for a marketplace product', () => {
		useSelector.mockImplementation( ( selector ) =>
			selector( {
				currentUser: { id: 1 },
				purchases: {
					hasLoadedUserPurchasesFromServer: true,
					data: [ { product_id: 2, user_id: 1 } ],
				},
			} )
		);

		const { result } = renderHook( () =>
			useCanPublishPluginReview( { isMarketplaceProduct: true, variations: [ { product_id: 2 } ] } )
		);

		expect( result.current ).toBe( true );
	} );

	it( 'returns false if the user is logged in but does not have an active subscription for a marketplace product', () => {
		useSelector.mockImplementation( ( selector ) =>
			selector( {
				currentUser: { id: 1 },
				purchases: {
					hasLoadedUserPurchasesFromServer: true,
					data: [],
				},
			} )
		);

		const { result } = renderHook( () =>
			useCanPublishPluginReview( { isMarketplaceProduct: true, variations: [ { product_id: 2 } ] } )
		);

		expect( result.current ).toBe( false );
	} );
} );
