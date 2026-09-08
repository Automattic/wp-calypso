/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import qs from 'qs';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { mockGetAvailabilityQuery } from '../../test-helpers/queries/availability';
import {
	mockGetBundleMetadataQuery,
	mockGetSuggestionsQuery,
} from '../../test-helpers/queries/suggestions';
import { queryClient, TestDomainSearch } from '../../test-helpers/renderer';
import { useInlineBundles } from '../use-inline-bundles';
import { useSuggestionsList } from '../use-suggestions-list';
import type { BundleSuggestion } from '@automattic/api-core';

const TEST_BUNDLE: BundleSuggestion = {
	sld: 'flowers',
	domains: [
		{ domain: 'flowers.com', cost: '$22.00', raw_price: 22, product_slug: 'domain_reg' },
		{ domain: 'flowers.net', cost: '$18.00', raw_price: 18, product_slug: 'domain_reg' },
	],
	bundle_price: 36,
	original_price: 44,
	discount_percent: 18,
	category: 'business',
	bundle_id: 'flowers-bundle',
	bundle_group_id: 'v1.flowers.deadbeef',
	catalogue_version: '1',
};

describe( 'bundle metadata shared request', () => {
	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	// Regression (DOMAINS-2225, case 5): after the FQDN gate was relaxed, both the
	// top BundleCard (bundleSuggestion) and the inline-bundle catalogue
	// (bundleTriggers) are enabled on an FQDN query. They share the
	// `domain-bundle-metadata` query key, so React Query must dedupe the
	// underlying `with_bundles=1` `/domains/suggestions` request to a single call.
	it( 'issues the with_bundles request once for both bundleSuggestion and bundleTriggers', async () => {
		mockGetSuggestionsQuery( { params: { query: 'flowers.com' }, suggestions: [] } );
		mockGetAvailabilityQuery( {
			params: { domainName: 'flowers.com' },
			availability: buildAvailability( { domain_name: 'flowers.com' } ),
		} );

		let withBundlesCallCount = 0;
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/domains/suggestions' )
			.query(
				qs.stringify(
					{
						include_wordpressdotcom: false,
						include_dotblogsubdomain: false,
						only_wordpressdotcom: false,
						quantity: 30,
						vendor: 'variation2_front',
						exact_sld_matches_only: false,
						include_internal_move_eligible: false,
						query: 'flowers.com',
						with_bundles: 1,
					},
					{ arrayFormat: 'brackets' }
				)
			)
			.reply( 200, () => {
				withBundlesCallCount++;
				return { bundle_suggestion: TEST_BUNDLE, bundle_triggers: [ 'com' ] };
			} );

		const { result } = renderHook(
			() => ( {
				suggestions: useSuggestionsList(),
				inline: useInlineBundles(),
			} ),
			{
				wrapper: ( { children } ) => (
					<TestDomainSearch query="flowers.com" config={ { showBundleSuggestions: true } }>
						{ children }
					</TestDomainSearch>
				),
			}
		);

		await waitFor( () => {
			expect( result.current.suggestions.bundleSuggestion ).toBeTruthy();
			expect( result.current.inline.bundleTriggers ).toEqual( [ 'com' ] );
		} );

		expect( result.current.suggestions.bundleSuggestion?.sld ).toBe( 'flowers' );
		expect( withBundlesCallCount ).toBe( 1 );
	} );

	// DOMAINS-2238: the backend anchors a bare-term bundle on its own suggestion
	// list, so the wrapped request must carry the plain request's params — a TLD
	// filter here changes which list the backend walks.
	it( 'sends the plain suggestion params, including the TLD filter, on the with_bundles request', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'flowers', tlds: [ 'com', 'net' ] },
			suggestions: [],
		} );

		const scope = mockGetBundleMetadataQuery( {
			params: { query: 'flowers', tlds: [ 'com', 'net' ] },
			bundleSuggestion: null,
			bundleTriggers: [ 'com' ],
		} );

		const { result } = renderHook( () => useInlineBundles(), {
			wrapper: ( { children } ) => (
				<TestDomainSearch
					query="flowers"
					config={ { showBundleSuggestions: true, allowedTlds: [ 'com', 'net' ] } }
				>
					{ children }
				</TestDomainSearch>
			),
		} );

		await waitFor( () => expect( result.current.bundleTriggers ).toEqual( [ 'com' ] ) );
		expect( scope.isDone() ).toBe( true );
	} );

	// DOMAINS-2238: because the wrapped request carries the plain params, those
	// params are part of the `domain-bundle-metadata` key. Two TLD filters on one
	// term are two different backend lists, so they must not share a cache entry.
	// Both trees stay mounted for the whole test: `staleTime: Infinity` means a
	// shared key would serve the second tree from the first tree's entry and leave
	// the second interceptor unconsumed.
	it( 'keeps separate cache entries for one query under two param sets', async () => {
		mockGetSuggestionsQuery( { params: { query: 'flowers', tlds: [ 'com' ] }, suggestions: [] } );
		mockGetSuggestionsQuery( {
			params: { query: 'flowers', tlds: [ 'com', 'net' ] },
			suggestions: [],
		} );

		const comScope = mockGetBundleMetadataQuery( {
			params: { query: 'flowers', tlds: [ 'com' ] },
			bundleTriggers: [ 'com' ],
		} );
		const comNetScope = mockGetBundleMetadataQuery( {
			params: { query: 'flowers', tlds: [ 'com', 'net' ] },
			bundleTriggers: [ 'com', 'net' ],
		} );

		const com = renderHook( () => useInlineBundles(), {
			wrapper: ( { children } ) => (
				<TestDomainSearch
					query="flowers"
					config={ { showBundleSuggestions: true, allowedTlds: [ 'com' ] } }
				>
					{ children }
				</TestDomainSearch>
			),
		} );

		const comNet = renderHook( () => useInlineBundles(), {
			wrapper: ( { children } ) => (
				<TestDomainSearch
					query="flowers"
					config={ { showBundleSuggestions: true, allowedTlds: [ 'com', 'net' ] } }
				>
					{ children }
				</TestDomainSearch>
			),
		} );

		await waitFor( () => {
			expect( com.result.current.bundleTriggers ).toEqual( [ 'com' ] );
			expect( comNet.result.current.bundleTriggers ).toEqual( [ 'com', 'net' ] );
		} );

		expect( comScope.isDone() ).toBe( true );
		expect( comNetScope.isDone() ).toBe( true );
	} );
} );
