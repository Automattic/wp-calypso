/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { mockGetSuggestionsQuery } from '../../test-helpers/queries/suggestions';
import { queryClient, TestDomainSearch } from '../../test-helpers/renderer';
import { useSuggestionsList } from '../use-suggestions-list';
import type { DomainSearchConfig } from '../../page/types';

const renderUseSuggestionsList = ( config?: Partial< DomainSearchConfig > ) =>
	renderHook( () => useSuggestionsList(), {
		wrapper: ( { children } ) => (
			<TestDomainSearch query="test" config={ config }>
				{ children }
			</TestDomainSearch>
		),
	} );

describe( 'useSuggestionsList — bundle suggestions', () => {
	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	it( 'surfaces a bundle suggestion when showBundleSuggestions is on', async () => {
		mockGetSuggestionsQuery( { params: { query: 'test' }, suggestions: [] } );

		const { result } = renderUseSuggestionsList( { showBundleSuggestions: true } );

		await waitFor( () => expect( result.current.bundleSuggestion ).toBeTruthy() );
		expect( result.current.bundleSuggestion?.sld ).toBe( 'test' );
		expect( result.current.bundleSuggestion?.domains.length ).toBeGreaterThan( 0 );
	} );

	it( 'does not surface a bundle suggestion when the flag is off', async () => {
		mockGetSuggestionsQuery( { params: { query: 'test' }, suggestions: [] } );

		const { result } = renderUseSuggestionsList( { showBundleSuggestions: false } );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.bundleSuggestion ).toBeUndefined();
	} );
} );
