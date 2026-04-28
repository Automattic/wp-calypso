/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

import { renderHook, waitFor } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useEmptyViewSuggestions } from '../use-empty-view-suggestions';

const mockUseSelect = useSelect as jest.Mock;

describe( 'useEmptyViewSuggestions', () => {
	beforeEach( () => {
		mockUseSelect.mockReturnValue( true );
		( window as unknown as { agentsManagerData?: unknown } ).agentsManagerData = undefined;
	} );

	afterEach( () => {
		jest.clearAllMocks();
		( window as unknown as { agentsManagerData?: unknown } ).agentsManagerData = undefined;
	} );

	it( 'returns reader-chat override suggestions even while the core store is not ready', async () => {
		mockUseSelect.mockReturnValue( false );
		( window as unknown as { agentsManagerData?: unknown } ).agentsManagerData = {
			agentId: 'reader-chat',
			readerSuggestions: [
				{
					id: 'reader-chip',
					label: 'Ask about this post',
					prompt: 'What is this post about?',
				},
			],
		};

		const loadedProviders = {
			getEmptyViewSuggestions: jest.fn( () => [
				{
					id: 'provider-chip',
					label: 'Provider suggestion',
					prompt: 'Provider prompt',
				},
			] ),
		};

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		await waitFor( () => {
			expect( result.current ).toEqual( [
				{
					id: 'reader-chip',
					label: 'Ask about this post',
					prompt: 'What is this post about?',
				},
			] );
		} );
		expect( loadedProviders.getEmptyViewSuggestions ).not.toHaveBeenCalled();
	} );

	it( 'waits for core store readiness before reading provider suggestions', () => {
		mockUseSelect.mockReturnValue( false );
		const loadedProviders = {
			getEmptyViewSuggestions: jest.fn( () => [
				{
					id: 'provider-chip',
					label: 'Provider suggestion',
					prompt: 'Provider prompt',
				},
			] ),
		};

		const { result } = renderHook( () => useEmptyViewSuggestions( { loadedProviders } ) );

		expect( result.current ).toBeNull();
		expect( loadedProviders.getEmptyViewSuggestions ).not.toHaveBeenCalled();
	} );
} );
