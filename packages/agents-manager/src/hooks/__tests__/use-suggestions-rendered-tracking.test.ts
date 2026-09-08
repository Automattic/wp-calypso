/**
 * @jest-environment jsdom
 */
jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: jest.fn(),
} ) );

import { act, renderHook } from '@testing-library/react';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import useSuggestionsRenderedTracking from '../use-suggestions-rendered-tracking';
import type { Suggestion } from '../../types';

type Options = Parameters< typeof useSuggestionsRenderedTracking >[ 0 ];

const contextual: Suggestion[] = [
	{ id: 'change-tone', label: 'Change tone', prompt: 'Change the tone' },
	{ id: 'check-grammar', label: 'Check grammar', prompt: 'Check the grammar' },
];
const contextualIds = new Set( contextual.map( ( suggestion ) => suggestion.id ) );
const starters: Suggestion[] = [
	{ id: 'getting-started', label: 'Getting started', prompt: 'getting-started' },
];

const blockOptions = ( selectedBlockType?: string, hasSuggestionsToRender = true ): Options => ( {
	selectedBlockType,
	contextualSuggestionIds: contextualIds,
	hasSuggestionsToRender,
} );

const renderTracking = ( initialProps: Options ) =>
	renderHook( ( options: Options ) => useSuggestionsRenderedTracking( options ), {
		initialProps,
	} );

describe( 'useSuggestionsRenderedTracking', () => {
	beforeEach( () => {
		jest.mocked( recordBigSkyTracksEvent ).mockClear();
	} );

	it( 'tracks the reported set with the block context when every chip is contextual', () => {
		const { result } = renderTracking( blockOptions( 'core/paragraph' ) );

		act( () => result.current.onSuggestionsRendered( contextual ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_chat_suggestions_rendered',
			{ suggestions: '|change-tone|check-grammar|', block_type: 'core/paragraph' }
		);
		expect( result.current.renderedSuggestionsRef.current ).toBe( contextual );
	} );

	it( 'omits the block context when the reported set is not fully contextual', () => {
		const { result } = renderTracking( blockOptions( 'core/paragraph' ) );

		act( () => result.current.onSuggestionsRendered( [ ...contextual, ...starters ] ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_chat_suggestions_rendered',
			{ suggestions: '|change-tone|check-grammar|getting-started|' }
		);
	} );

	it( 'does not track the same set twice', () => {
		const { result } = renderTracking( blockOptions() );

		act( () => result.current.onSuggestionsRendered( starters ) );
		act( () => result.current.onSuggestionsRendered( [ ...starters ] ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'tracks the same set again when the block type changes', () => {
		const { result, rerender } = renderTracking( blockOptions( 'core/paragraph' ) );
		act( () => result.current.onSuggestionsRendered( contextual ) );

		rerender( blockOptions( 'core/heading' ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( recordBigSkyTracksEvent ).toHaveBeenLastCalledWith(
			'jetpack_big_sky_chat_suggestions_rendered',
			{ suggestions: '|change-tone|check-grammar|', block_type: 'core/heading' }
		);
	} );

	it( 'keeps lingering contextual chips classified under the deselected block', () => {
		const { result, rerender } = renderTracking( blockOptions( 'core/paragraph' ) );
		act( () => result.current.onSuggestionsRendered( contextual ) );

		rerender( blockOptions( undefined ) );
		rerender( blockOptions( 'core/paragraph' ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'holds a block-context re-track while nothing is fed, then applies it when chips return', () => {
		const { result, rerender } = renderTracking( blockOptions( 'core/paragraph' ) );
		act( () => result.current.onSuggestionsRendered( contextual ) );

		rerender( blockOptions( 'core/heading', false ) );
		expect( result.current.renderedSuggestionsRef.current ).toBe( contextual );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );

		rerender( blockOptions( 'core/heading', true ) );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( recordBigSkyTracksEvent ).toHaveBeenLastCalledWith(
			'jetpack_big_sky_chat_suggestions_rendered',
			{ suggestions: '|change-tone|check-grammar|', block_type: 'core/heading' }
		);
	} );
} );
