/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { buildSuggestion } from '../../test-helpers/factories/suggestions';
import { mockGetSuggestionsQuery } from '../../test-helpers/queries/suggestions';
import { queryClient, TestDomainSearch } from '../../test-helpers/renderer';
import { useRequestTracking } from '../use-request-tracking';
import { useSuggestionsList } from '../use-suggestions-list';
import type { DomainSearchEvents } from '../../page/types';

const renderUseRequestTracking = (
	events: Partial< DomainSearchEvents >,
	initialQuery: string
) => {
	// renderHook's wrapper only receives `children`, so the query is read from a
	// closure that `setQuery` updates before re-rendering.
	let currentQuery = initialQuery;

	// The suggestions query is enabled by the results list, as on the real page.
	const result = renderHook(
		() => {
			useSuggestionsList();
			return useRequestTracking();
		},
		{
			wrapper: ( { children } ) => (
				<TestDomainSearch query={ currentQuery } events={ events }>
					{ children }
				</TestDomainSearch>
			),
		}
	);

	return {
		...result,
		setQuery: ( query: string ) => {
			currentQuery = query;
			result.rerender();
		},
	};
};

describe( 'useRequestTracking', () => {
	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	it( 'fires onSearch once per accepted response, with the prefilled trigger for the initial query', async () => {
		const onSearch = jest.fn();
		const onSuggestionsReceive = jest.fn();

		mockGetSuggestionsQuery( {
			params: { query: 'prefilled' },
			suggestions: [
				buildSuggestion( { domain_name: 'prefilled.com', result_set_id: 'result-set-1' } ),
			],
		} );

		const { rerender } = renderUseRequestTracking(
			{ onSearch, onSuggestionsReceive },
			'prefilled'
		);

		await waitFor( () => expect( onSearch ).toHaveBeenCalledTimes( 1 ) );

		expect( onSearch ).toHaveBeenCalledWith( 'prefilled', expect.any( String ), 'prefilled' );
		expect( onSuggestionsReceive ).toHaveBeenCalledWith(
			'prefilled',
			[ 'prefilled.com' ],
			expect.any( Number ),
			{
				searchId: onSearch.mock.calls[ 0 ][ 1 ],
				resultSetId: 'result-set-1',
				resultCountFeatured: 1,
				resultCountList: 0,
			}
		);

		// Re-rendering with the same response does not fire it again.
		rerender();

		expect( onSearch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not fire onSearch for a superseded response', async () => {
		const onSearch = jest.fn();

		mockGetSuggestionsQuery( {
			params: { query: 'first' },
			suggestions: [ buildSuggestion( { domain_name: 'first.com' } ) ],
			delayMs: 200,
		} );
		mockGetSuggestionsQuery( {
			params: { query: 'second' },
			suggestions: [ buildSuggestion( { domain_name: 'second.com' } ) ],
		} );

		const { setQuery } = renderUseRequestTracking( { onSearch }, 'first' );

		setQuery( 'second' );

		await waitFor( () => expect( onSearch ).toHaveBeenCalledTimes( 1 ) );
		expect( onSearch ).toHaveBeenCalledWith( 'second', expect.any( String ), 'prefilled' );

		// Let the superseded request settle and confirm it never counts.
		await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );
		expect( onSearch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not fire onSearch when the request errors', async () => {
		const onSearch = jest.fn();
		const onSuggestionsReceive = jest.fn();

		mockGetSuggestionsQuery( {
			params: { query: 'broken' },
			suggestions: new Error( 'Request failed' ),
		} );

		renderUseRequestTracking( { onSearch, onSuggestionsReceive }, 'broken' );

		await waitFor( () => expect( onSuggestionsReceive ).toHaveBeenCalled() );
		expect( onSearch ).not.toHaveBeenCalled();
	} );
} );
