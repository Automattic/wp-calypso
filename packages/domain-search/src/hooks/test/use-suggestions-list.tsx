/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	mockGetBundleSuggestionQuery,
	mockGetSuggestionsQuery,
} from '../../test-helpers/queries/suggestions';
import { queryClient, TestDomainSearch } from '../../test-helpers/renderer';
import { useSuggestionsList } from '../use-suggestions-list';
import type { DomainSearchConfig } from '../../page/types';
import type { BundleSuggestion } from '@automattic/api-core';

const TEST_BUNDLE_SUGGESTION: BundleSuggestion = {
	sld: 'test',
	domains: [
		{ domain: 'test.com', cost: '$22.00', raw_price: 22, product_slug: 'domain_reg' },
		{ domain: 'test.org', cost: '$22.00', raw_price: 22, product_slug: 'domain_reg' },
	],
	bundle_price: 36,
	original_price: 44,
	discount_percent: 18,
	category: 'business',
	bundle_id: 'test-bundle',
	bundle_group_id: 'v1.test.deadbeef',
	catalogue_version: '1',
};

const renderUseSuggestionsList = ( config?: Partial< DomainSearchConfig >, query = 'test' ) =>
	renderHook( () => useSuggestionsList(), {
		wrapper: ( { children } ) => (
			<TestDomainSearch query={ query } config={ config }>
				{ children }
			</TestDomainSearch>
		),
	} );

describe( 'useSuggestionsList — bundle suggestions', () => {
	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	// The top bundle card is the FQDN path, so bundleSuggestion is only fetched
	// for an FQDN query (a bare-term search shows inline bundle rows instead).
	it( 'surfaces a bundle suggestion for an FQDN query when showBundleSuggestions is on', async () => {
		mockGetSuggestionsQuery( { params: { query: 'test.com' }, suggestions: [] } );
		mockGetBundleSuggestionQuery( {
			params: { query: 'test.com' },
			bundleSuggestion: TEST_BUNDLE_SUGGESTION,
		} );

		const { result } = renderUseSuggestionsList( { showBundleSuggestions: true }, 'test.com' );

		await waitFor( () => expect( result.current.bundleSuggestion ).toBeTruthy() );
		expect( result.current.bundleSuggestion?.sld ).toBe( 'test' );
		expect( result.current.bundleSuggestion?.domains.length ).toBeGreaterThan( 0 );
	} );

	it( 'does not surface a bundle suggestion for a bare-term query', async () => {
		mockGetSuggestionsQuery( { params: { query: 'test' }, suggestions: [] } );

		const { result } = renderUseSuggestionsList( { showBundleSuggestions: true } );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.bundleSuggestion ).toBeUndefined();
	} );

	it( 'does not surface a bundle suggestion when the flag is off', async () => {
		mockGetSuggestionsQuery( { params: { query: 'test.com' }, suggestions: [] } );

		const { result } = renderUseSuggestionsList( { showBundleSuggestions: false }, 'test.com' );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.bundleSuggestion ).toBeUndefined();
	} );
} );
