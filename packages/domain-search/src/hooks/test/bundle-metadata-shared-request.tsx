/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { mockGetAvailabilityQuery } from '../../test-helpers/queries/availability';
import { mockGetSuggestionsQuery } from '../../test-helpers/queries/suggestions';
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
			.query( { vendor: 'variation2_front', with_bundles: 1, query: 'flowers.com' } )
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
} );
