/**
 * @jest-environment jsdom
 */
let mockSelectedBlockType: string | undefined;

jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: jest.fn(),
} ) );
jest.mock( '@wordpress/data', () => ( {
	useSelect: ( mapSelect: ( select: () => object ) => unknown ) =>
		mapSelect( () => ( {
			getSelectedBlock: () => ( mockSelectedBlockType ? { name: mockSelectedBlockType } : null ),
		} ) ),
} ) );

import { act, renderHook } from '@testing-library/react';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import { useSuggestionTracking } from '../use-suggestion-tracking';
import type { Suggestion } from '@automattic/agenttic-ui';

type Options = Parameters< typeof useSuggestionTracking >[ 0 ];

const contextual: Suggestion[] = [
	{ id: 'change-tone', label: 'Change tone', prompt: 'Change the tone' },
	{ id: 'check-grammar', label: 'Check grammar', prompt: 'Check the grammar' },
];
const contextualIds = new Set( contextual.map( ( suggestion ) => suggestion.id ) );
const starters: Suggestion[] = [
	{ id: 'getting-started', label: 'Getting started', prompt: 'getting-started' },
];

// Selects the block before the next render, which reads it through `useSelect`.
const blockOptions = ( selectedBlockType?: string, hasSuggestionsToRender = true ): Options => {
	mockSelectedBlockType = selectedBlockType;
	return { contextualSuggestionIds: contextualIds, hasSuggestionsToRender };
};

const renderTracking = ( initialProps: Options ) =>
	renderHook( ( options: Options ) => useSuggestionTracking( options ), {
		initialProps,
	} );

describe( 'useSuggestionTracking', () => {
	beforeEach( () => {
		mockSelectedBlockType = undefined;
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
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );

		rerender( blockOptions( 'core/heading', true ) );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( recordBigSkyTracksEvent ).toHaveBeenLastCalledWith(
			'jetpack_big_sky_chat_suggestions_rendered',
			{ suggestions: '|change-tone|check-grammar|', block_type: 'core/heading' }
		);
	} );

	it( 'tracks a click in a message with its own list', () => {
		const design: Suggestion[] = [
			'customize-colors',
			'change-page-layout',
			'choose-new-fonts',
			'edit-pages',
		].map( ( id ) => ( { id, label: id, prompt: id } ) );
		const { result } = renderTracking( blockOptions() );
		act( () => result.current.onSuggestionsRendered( design.slice( 0, 3 ) ) );
		jest.mocked( recordBigSkyTracksEvent ).mockClear();

		act( () => result.current.trackSuggestionClick( design[ 0 ], design, true ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_chat_suggestion_click',
			expect.objectContaining( {
				available_suggestions: '|customize-colors|change-page-layout|choose-new-fonts|edit-pages|',
			} )
		);
	} );
} );
