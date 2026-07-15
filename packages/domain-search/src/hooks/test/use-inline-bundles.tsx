/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { buildCart, buildCartItem } from '../../test-helpers/factories/cart';
import {
	mockGetBundleForDomainQuery,
	mockGetBundleTriggersQuery,
} from '../../test-helpers/queries/suggestions';
import { queryClient, TestDomainSearch } from '../../test-helpers/renderer';
import { useInlineBundles } from '../use-inline-bundles';
import type { DomainSearchCart } from '../../page/types';
import type { BundleSuggestion } from '@automattic/api-core';

const BUNDLE_FOR_FLOWERS: BundleSuggestion = {
	sld: 'flowers',
	domains: [
		{
			domain: 'flowers.com',
			cost: '$22.00',
			raw_price: 22,
			product_slug: 'domain_reg',
			role: 'primary',
		},
		{
			domain: 'flowers.net',
			cost: '$18.00',
			raw_price: 18,
			product_slug: 'domain_reg',
			role: 'companion',
		},
	],
	bundle_price: 36,
	original_price: 44,
	discount_percent: 18,
	category: 'business',
	bundle_id: 'flowers-bundle',
	bundle_group_id: 'v1.flowers.deadbeef',
	catalogue_version: '1',
};

const renderUseInlineBundles = ( {
	query,
	cart,
	showBundleSuggestions = true,
}: {
	query: string;
	cart?: Partial< DomainSearchCart >;
	showBundleSuggestions?: boolean;
} ) =>
	renderHook( () => useInlineBundles(), {
		wrapper: ( { children } ) => (
			<TestDomainSearch
				query={ query }
				cart={ buildCart( cart ) }
				config={ { showBundleSuggestions } }
			>
				{ children }
			</TestDomainSearch>
		),
	} );

describe( 'useInlineBundles', () => {
	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	it( 'fetches a bundle for a cart item whose TLD is a trigger', async () => {
		mockGetBundleTriggersQuery( { params: { query: 'flowers' }, bundleTriggers: [ 'com' ] } );
		mockGetBundleForDomainQuery( { fqdn: 'flowers.com', bundleSuggestion: BUNDLE_FOR_FLOWERS } );

		const { result } = renderUseInlineBundles( {
			query: 'flowers',
			cart: { items: [ buildCartItem( { domain: 'flowers', tld: 'com' } ) ] },
		} );

		await waitFor( () =>
			expect( result.current.getInlineBundle( 'flowers.com' )?.bundle ).toBeTruthy()
		);
		expect( result.current.bundleTriggers ).toEqual( [ 'com' ] );
		expect( result.current.getInlineBundle( 'flowers.com' )?.bundle?.sld ).toBe( 'flowers' );
	} );

	it( 'does not fetch a bundle for a cart item whose TLD is not a trigger', async () => {
		mockGetBundleTriggersQuery( { params: { query: 'flowers' }, bundleTriggers: [ 'com' ] } );

		const { result } = renderUseInlineBundles( {
			query: 'flowers',
			cart: { items: [ buildCartItem( { domain: 'flowers', tld: 'net' } ) ] },
		} );

		await waitFor( () => expect( result.current.bundleTriggers ).toEqual( [ 'com' ] ) );
		expect( result.current.getInlineBundle( 'flowers.net' ) ).toBeUndefined();
	} );

	it( 'is gated to bare-term searches: an FQDN query never fetches triggers or bundles', async () => {
		const { result } = renderUseInlineBundles( {
			query: 'flowers.com',
			cart: { items: [ buildCartItem( { domain: 'flowers', tld: 'com' } ) ] },
		} );

		await waitFor( () => expect( result.current.bundleTriggers ).toEqual( [] ) );
		expect( result.current.getInlineBundle( 'flowers.com' ) ).toBeUndefined();
	} );

	it( 'is gated on the bundle flag: nothing is fetched when showBundleSuggestions is off', async () => {
		const { result } = renderUseInlineBundles( {
			query: 'flowers',
			cart: { items: [ buildCartItem( { domain: 'flowers', tld: 'com' } ) ] },
			showBundleSuggestions: false,
		} );

		await waitFor( () => expect( result.current.bundleTriggers ).toEqual( [] ) );
		expect( result.current.getInlineBundle( 'flowers.com' ) ).toBeUndefined();
	} );

	it( 'does not offer an inline bundle for a domain added only as a bundle companion', async () => {
		mockGetBundleTriggersQuery( { params: { query: 'flowers' }, bundleTriggers: [ 'com' ] } );

		const { result } = renderUseInlineBundles( {
			query: 'flowers',
			cart: {
				items: [
					buildCartItem( {
						domain: 'flowers',
						tld: 'com',
						bundle: { groupId: 'g1', price: '$36', isPrimary: false },
					} ),
				],
			},
		} );

		await waitFor( () => expect( result.current.bundleTriggers ).toEqual( [ 'com' ] ) );
		expect( result.current.getInlineBundle( 'flowers.com' ) ).toBeUndefined();
	} );

	it( 'keeps the inline bundle for a trigger the user bundled (its own primary)', async () => {
		mockGetBundleTriggersQuery( { params: { query: 'flowers' }, bundleTriggers: [ 'com' ] } );
		mockGetBundleForDomainQuery( { fqdn: 'flowers.com', bundleSuggestion: BUNDLE_FOR_FLOWERS } );

		const { result } = renderUseInlineBundles( {
			query: 'flowers',
			cart: {
				items: [
					buildCartItem( {
						domain: 'flowers',
						tld: 'com',
						bundle: { groupId: 'g1', price: '$36', isPrimary: true },
					} ),
				],
			},
		} );

		await waitFor( () =>
			expect( result.current.getInlineBundle( 'flowers.com' )?.bundle ).toBeTruthy()
		);
	} );
} );
