/**
 * Tests for the Jetpack AI Sidebar provider.
 *
 * Focused on the show-component flow, the checkpoint hook, and the
 * getChatComponent resolver — these are the pieces AM wires into its chat.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { act, render } from '@testing-library/react';
import React from 'react';
import ReviewMediation from './components/review-mediation';
import TitlePicker from './components/title-picker';
import { undoBlockEdit } from './utils/block-actions';
import {
	applyReviewEdit,
	findBlockElement,
	findBlockListLayout,
	getChatComponent,
	getEmptyViewSuggestions,
	contextProvider,
	toolProvider,
	useAbilitiesSetup,
	useCheckpoint,
	useSuggestions,
} from './index';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const mockSetIsSplitScreen = jest.fn();
const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;
let mockSelectedBlock: any = null;
let mockCurrentPostType: string | undefined = 'post';
let mockBlocksByClientId: Record< string, any > = {};

jest.mock( '@wordpress/components', () => {
	const React = require( 'react' );
	return {
		Panel: ( { children }: any ) => React.createElement( 'div', null, children ),
		PanelBody: ( { children }: any ) => React.createElement( 'section', null, children ),
	};
} );

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn( ( store: string ) => {
		if ( store === 'automattic/agents-manager' ) {
			return { setIsSplitScreen: mockSetIsSplitScreen };
		}
		return {};
	} ),
	useDispatch: () => ( {
		editPost: jest.fn(),
		selectBlock: jest.fn(),
	} ),
	useSelect: ( fn: any ) =>
		fn( ( store: string ) => {
			if ( store === 'core/block-editor' ) {
				return {
					getSelectedBlock: () => mockSelectedBlock,
					getBlock: ( clientId: string ) => mockBlocksByClientId[ clientId ],
					getBlocks: () => [],
				};
			}
			if ( store === 'core/editor' ) {
				return {
					getCurrentPostType: () => mockCurrentPostType,
				};
			}
			return {};
		} ),
} ) );

// Stub @wordpress/data on window so useCheckpoint / handleShowComponent
// can read/write the post title and current post id via the core/editor store.
function installWpDataMock( initialTitle: string, postId = 123 ) {
	const state = { title: initialTitle };
	( window as any ).wp = {
		data: {
			select: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						getCurrentPostId: () => postId,
						getEditedPostAttribute: ( attr: string ) =>
							attr === 'title' ? state.title : undefined,
					};
				}
				return undefined;
			},
			dispatch: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						editPost: ( attrs: { title?: string } ) => {
							if ( typeof attrs.title === 'string' ) {
								state.title = attrs.title;
							}
						},
					};
				}
				return undefined;
			},
		},
	};
	return state;
}

function installPostTypeMock( postType?: string ) {
	( window as any ).wp = {
		data: {
			select: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						getCurrentPostType: () => postType,
					};
				}
				if ( store === 'core/block-editor' ) {
					return {
						getSelectedBlock: () => mockSelectedBlock,
						getBlock: ( clientId: string ) => mockBlocksByClientId[ clientId ],
						getBlocks: () => [],
					};
				}
				return undefined;
			},
		},
	};
}

function installAiEditorialReviewData( features: Record< string, boolean > = {} ) {
	( globalThis as any ).agentsManagerData = {
		aiEditorialReviewEnabled: true,
		jetpackAiSidebarPreview: {
			enabled: true,
			features: {
				aiEditorialReview: true,
				blockTransformations: true,
				optimizeTitleSuggestion: false,
				chatHistory: false,
				supportGuides: false,
				...features,
			},
		},
	};
}

function SuggestionsProbe( {
	onSuggestions,
	maxSuggestions,
	suggestionsVisible = true,
}: {
	onSuggestions: ( suggestions: any[] ) => void;
	maxSuggestions?: number;
	suggestionsVisible?: boolean;
} ) {
	const { suggestions } = useSuggestions( maxSuggestions, { suggestionsVisible } );
	React.useEffect( () => {
		onSuggestions( suggestions );
	}, [ onSuggestions, suggestions ] );
	return null;
}

function getTracksCalls( eventName: string ) {
	return mockedRecordTracksEvent.mock.calls.filter( ( [ name ] ) => name === eventName );
}

describe( 'getChatComponent', () => {
	it( 'returns TitlePicker for type "title-picker"', () => {
		expect( getChatComponent( 'title-picker' ) ).toBe( TitlePicker );
	} );

	it( 'returns ReviewMediation for type "review-mediation"', () => {
		expect( getChatComponent( 'review-mediation' ) ).toBe( ReviewMediation );
	} );

	it( 'returns null for an unknown type', () => {
		expect( getChatComponent( 'font-picker' ) ).toBeNull();
		expect( getChatComponent( '' ) ).toBeNull();
		expect( getChatComponent( 'anything-else' ) ).toBeNull();
	} );
} );

describe( 'getEmptyViewSuggestions', () => {
	beforeEach( () => {
		mockedRecordTracksEvent.mockClear();
	} );

	afterEach( () => {
		delete ( globalThis as any ).agentsManagerData;
		delete ( window as any ).wp;
	} );

	it( 'hides AI Editorial Review by default', () => {
		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );
		expect( labels ).toContain( 'Optimize Title' );
		expect( labels ).not.toContain( 'AI Editorial Review' );
	} );

	it( 'shows AI Editorial Review when enabled by agentsManagerData', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );
		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).toContain( 'AI Editorial Review' );
	} );

	it( 'supports the legacy reviewMediatorEnabled flag while bundles roll forward', () => {
		( globalThis as any ).agentsManagerData = { reviewMediatorEnabled: true };
		installPostTypeMock( 'post' );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).toContain( 'Optimize Title' );
		expect( labels ).toContain( 'AI Editorial Review' );
	} );

	it( 'hides AI Editorial Review on page editors', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'page' );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).not.toContain( 'AI Editorial Review' );
	} );

	it( 'hides AI Editorial Review until the post type is known', () => {
		installAiEditorialReviewData();
		installPostTypeMock();

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).not.toContain( 'AI Editorial Review' );
	} );

	it( 'hides Optimize Title when the preview feature disables it', () => {
		installAiEditorialReviewData( { aiEditorialReview: false, optimizeTitleSuggestion: false } );
		installPostTypeMock( 'post' );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).not.toContain( 'AI Editorial Review' );
	} );

	it( 'treats missing preview features as disabled', () => {
		( globalThis as any ).agentsManagerData = {
			aiEditorialReviewEnabled: true,
			jetpackAiSidebarPreview: {
				enabled: true,
				features: { aiEditorialReview: true },
			},
		};
		installPostTypeMock( 'post' );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).toContain( 'AI Editorial Review' );
	} );
} );

describe( 'useSuggestions', () => {
	beforeEach( () => {
		mockSelectedBlock = null;
		mockBlocksByClientId = {};
		mockCurrentPostType = 'post';
		mockSetIsSplitScreen.mockReset();
		mockedRecordTracksEvent.mockClear();
		delete ( globalThis as any ).agentsManagerData;
	} );

	afterEach( () => {
		delete ( globalThis as any ).agentsManagerData;
		delete ( window as any ).wp;
	} );

	it( 'does not track rendered suggestions when the suggestions are not visible', () => {
		installAiEditorialReviewData();
		mockSelectedBlock = { clientId: 'b-hidden', name: 'core/paragraph' };
		const onSuggestions = jest.fn();

		render( React.createElement( SuggestionsProbe, { onSuggestions, suggestionsVisible: false } ) );

		const latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toEqual( [
			'Translate content',
			'Change tone',
			'Check grammar',
			'Simplify text',
			'AI Editorial Review',
		] );
		expect( getTracksCalls( 'jetpack_ai_editorial_review_suggestion_rendered' ) ).toEqual( [] );
		expect( getTracksCalls( 'jetpack_ai_block_transformation_suggestion_rendered' ) ).toEqual( [] );
	} );

	it( 'appends AI Editorial Review to block-specific suggestions', () => {
		installAiEditorialReviewData();
		mockSelectedBlock = { clientId: 'b1', name: 'core/paragraph' };
		const onSuggestions = jest.fn();

		render( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		const latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toEqual( [
			'Translate content',
			'Change tone',
			'Check grammar',
			'Simplify text',
			'AI Editorial Review',
		] );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_editorial_review_suggestion_rendered',
			{}
		);
		expect( getTracksCalls( 'jetpack_ai_block_transformation_suggestion_rendered' ) ).toEqual( [
			[
				'jetpack_ai_block_transformation_suggestion_rendered',
				{
					suggestion_id: 'translate',
					suggestion_type: 'text',
					block_type: 'core/paragraph',
					surface: 'jetpack_ai_sidebar',
				},
			],
			[
				'jetpack_ai_block_transformation_suggestion_rendered',
				{
					suggestion_id: 'change-tone',
					suggestion_type: 'text',
					block_type: 'core/paragraph',
					surface: 'jetpack_ai_sidebar',
				},
			],
			[
				'jetpack_ai_block_transformation_suggestion_rendered',
				{
					suggestion_id: 'check-grammar',
					suggestion_type: 'text',
					block_type: 'core/paragraph',
					surface: 'jetpack_ai_sidebar',
				},
			],
			[
				'jetpack_ai_block_transformation_suggestion_rendered',
				{
					suggestion_id: 'simplify-text',
					suggestion_type: 'text',
					block_type: 'core/paragraph',
					surface: 'jetpack_ai_sidebar',
				},
			],
		] );
	} );

	it( 'keeps AI Editorial Review visible when block suggestions are limited', () => {
		installAiEditorialReviewData();
		mockSelectedBlock = { clientId: 'b-limited', name: 'core/heading' };
		const onSuggestions = jest.fn();

		render(
			React.createElement( SuggestionsProbe, {
				onSuggestions,
				maxSuggestions: 3,
			} )
		);

		const latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toEqual( [
			'Translate content',
			'Check grammar',
			'AI Editorial Review',
		] );
		expect( getTracksCalls( 'jetpack_ai_block_transformation_suggestion_rendered' ) ).toEqual( [
			[
				'jetpack_ai_block_transformation_suggestion_rendered',
				{
					suggestion_id: 'translate',
					suggestion_type: 'text',
					block_type: 'core/heading',
					surface: 'jetpack_ai_sidebar',
				},
			],
			[
				'jetpack_ai_block_transformation_suggestion_rendered',
				{
					suggestion_id: 'check-grammar',
					suggestion_type: 'text',
					block_type: 'core/heading',
					surface: 'jetpack_ai_sidebar',
				},
			],
		] );
	} );

	it( 'shows post-level suggestions after the selected-block chip is cleared', () => {
		installAiEditorialReviewData();
		const block = { clientId: 'b-clear', name: 'core/paragraph' };
		mockSelectedBlock = block;
		mockBlocksByClientId[ block.clientId ] = block;
		const onSuggestions = jest.fn();

		const { rerender } = render( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		let latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toContain(
			'Translate content'
		);

		mockSelectedBlock = null;
		act( () => {
			window.dispatchEvent( new Event( 'agents-manager-selected-block-cleared' ) );
		} );
		rerender( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toEqual( [
			'AI Editorial Review',
		] );
	} );

	it( 'tracks rendered image block transformation suggestions', () => {
		installAiEditorialReviewData();
		mockSelectedBlock = { clientId: 'b2', name: 'core/image' };
		const onSuggestions = jest.fn();

		render( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		const latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toEqual( [
			'Generate alt text',
			'AI Editorial Review',
		] );
		expect( getTracksCalls( 'jetpack_ai_block_transformation_suggestion_rendered' ) ).toEqual( [
			[
				'jetpack_ai_block_transformation_suggestion_rendered',
				{
					suggestion_id: 'generate-alt-text',
					suggestion_type: 'image',
					block_type: 'core/image',
					surface: 'jetpack_ai_sidebar',
				},
			],
		] );
	} );

	it( 'keeps AI Editorial Review when the preview feature disables block transformations', () => {
		installAiEditorialReviewData( { blockTransformations: false } );
		mockSelectedBlock = { clientId: 'b1', name: 'core/paragraph' };
		const onSuggestions = jest.fn();

		render( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		const latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toEqual( [
			'AI Editorial Review',
		] );
	} );

	it( 'keeps AI Editorial Review when the block transformations preview feature is missing', () => {
		( globalThis as any ).agentsManagerData = {
			aiEditorialReviewEnabled: true,
			jetpackAiSidebarPreview: {
				enabled: true,
				features: { aiEditorialReview: true },
			},
		};
		mockSelectedBlock = { clientId: 'b1', name: 'core/paragraph' };
		const onSuggestions = jest.fn();

		render( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		const latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toEqual( [
			'AI Editorial Review',
		] );
	} );

	it( 'opens split-screen when the AI Editorial Review suggestion is clicked', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		const mediationPrompt = getEmptyViewSuggestions().find(
			( suggestion ) => suggestion.id === 'mediate-review-notes'
		)?.prompt;

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: mediationPrompt },
				} )
			);
		} );

		expect( mockSetIsSplitScreen ).toHaveBeenCalledWith( true );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_editorial_review_suggestion_click',
			{}
		);
		expect( getTracksCalls( 'jetpack_ai_block_transformation_suggestion_click' ) ).toEqual( [] );
	} );

	it( 'tracks block transformation suggestion clicks', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		mockSelectedBlock = { clientId: 'b3', name: 'core/heading' };

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );
		mockedRecordTracksEvent.mockClear();

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: 'Simplify this text to make it easier to read' },
				} )
			);
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_block_transformation_suggestion_click',
			{
				suggestion_id: 'simplify-text',
				suggestion_type: 'text',
				block_type: 'core/heading',
				surface: 'jetpack_ai_sidebar',
			}
		);
	} );

	it( 'tracks block transformation suggestion clicks by label', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		mockSelectedBlock = { clientId: 'b4', name: 'core/paragraph' };

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );
		mockedRecordTracksEvent.mockClear();

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: 'Check grammar' },
				} )
			);
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_block_transformation_suggestion_click',
			{
				suggestion_id: 'check-grammar',
				suggestion_type: 'text',
				block_type: 'core/paragraph',
				surface: 'jetpack_ai_sidebar',
			}
		);
	} );

	it( 'tracks block transformation suggestion clicks after block selection is cleared', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		mockSelectedBlock = { clientId: 'b5', name: 'core/paragraph' };

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );
		mockedRecordTracksEvent.mockClear();
		mockSelectedBlock = null;

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: 'Check the grammar and spelling of this text' },
				} )
			);
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_block_transformation_suggestion_click',
			{
				suggestion_id: 'check-grammar',
				suggestion_type: 'text',
				block_type: 'core/paragraph',
				surface: 'jetpack_ai_sidebar',
			}
		);
	} );

	it( 'does not track block transformation clicks for unknown prompt values', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		mockSelectedBlock = { clientId: 'b6', name: 'core/heading' };

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );
		mockedRecordTracksEvent.mockClear();

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: 'Write an unrelated prompt' },
				} )
			);
		} );

		expect( getTracksCalls( 'jetpack_ai_block_transformation_suggestion_click' ) ).toEqual( [] );
	} );

	it( 'does not open split-screen when AI Editorial Review is unavailable', () => {
		installAiEditorialReviewData();
		mockCurrentPostType = 'page';
		installPostTypeMock( 'page' );

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: 'unavailable suggestion prompt' },
				} )
			);
		} );

		expect( mockSetIsSplitScreen ).not.toHaveBeenCalled();
	} );

	it( 're-shows block suggestions when a block action completes', () => {
		installAiEditorialReviewData();
		mockSelectedBlock = { clientId: 'b1', name: 'core/paragraph' };
		const onSuggestions = jest.fn();

		render( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: 'Check the grammar and spelling of this text' },
				} )
			);
		} );

		let latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions ).toEqual( [] );

		act( () => {
			window.dispatchEvent( new Event( 'jetpack-ai-sidebar-block-action-complete' ) );
		} );

		latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toEqual( [
			'Translate content',
			'Change tone',
			'Check grammar',
			'Simplify text',
			'AI Editorial Review',
		] );
	} );

	it( 'does not start the selected block shimmer when a suggestion is only selected', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		mockSelectedBlock = { clientId: 'b1', name: 'core/paragraph' };
		const blockEl = document.createElement( 'div' );
		blockEl.setAttribute( 'data-block', 'b1' );
		document.body.appendChild( blockEl );

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: 'Check the grammar and spelling of this text' },
				} )
			);
		} );

		expect( blockEl.classList.contains( 'jetpack-ai-is-processing' ) ).toBe( false );
		expect( blockEl.classList.contains( 'jetpack-ai-is-processing-content' ) ).toBe( false );
	} );

	it( 'starts the selected block shimmer when AM starts processing', () => {
		jest.useFakeTimers();
		installPostTypeMock( 'post' );
		mockSelectedBlock = { clientId: 'lQ0k', name: 'core/paragraph' };
		const blockEl = document.createElement( 'div' );
		blockEl.setAttribute( 'data-block', 'lQ0k' );
		document.body.appendChild( blockEl );

		useAbilitiesSetup( {
			addMessage: () => undefined,
			clearSuggestions: () => undefined,
			isProcessing: false,
		} as any );
		useAbilitiesSetup( {
			addMessage: () => undefined,
			clearSuggestions: () => undefined,
			isProcessing: true,
		} as any );

		expect( blockEl.classList.contains( 'jetpack-ai-is-processing' ) ).toBe( true );
		expect( blockEl.classList.contains( 'jetpack-ai-is-processing-content' ) ).toBe( true );
		useAbilitiesSetup( {
			addMessage: () => undefined,
			clearSuggestions: () => undefined,
			isProcessing: false,
		} as any );
		expect( blockEl.classList.contains( 'jetpack-ai-is-processing' ) ).toBe( false );
		expect( blockEl.classList.contains( 'jetpack-ai-is-processing-content' ) ).toBe( false );
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	} );
} );

describe( 'contextProvider', () => {
	afterEach( () => {
		delete ( window as any ).wp;
	} );

	it( 'includes the current post type in client context', () => {
		installPostTypeMock( 'post' );

		expect( contextProvider.getClientContext().currentScreen ).toMatchObject( {
			url: window.location.href,
			postType: 'post',
		} );
	} );
} );

describe( 'toolProvider', () => {
	beforeEach( () => {
		// Ensure wp.abilities is undefined so getAbilities falls into the
		// empty-base case and only includes the provider's own definitions.
		( window as any ).wp = {};
	} );

	afterEach( () => {
		delete ( globalThis as any ).agentsManagerData;
		delete ( window as any ).wp;
	} );

	describe( 'getAbilities', () => {
		it( 'includes update-block-content and big_sky__show_component', async () => {
			const abilities = await toolProvider.getAbilities();
			const names = abilities.map( ( a: any ) => a.name );

			expect( names ).toContain( 'wpcom/update-block-content' );
			expect( names ).toContain( 'big_sky__show_component' );
		} );

		it( 'wires a callback on each provided ability', async () => {
			const abilities = await toolProvider.getAbilities();
			const showComponent = abilities.find( ( a: any ) => a.name === 'big_sky__show_component' );
			const updateBlock = abilities.find( ( a: any ) => a.name === 'wpcom/update-block-content' );

			expect( typeof showComponent?.callback ).toBe( 'function' );
			expect( typeof updateBlock?.callback ).toBe( 'function' );
		} );

		it( 'omits update-block-content when block transformations are disabled', async () => {
			installAiEditorialReviewData( { blockTransformations: false } );

			const abilities = await toolProvider.getAbilities();
			const names = abilities.map( ( a: any ) => a.name );

			expect( names ).not.toContain( 'wpcom/update-block-content' );
			expect( names ).toContain( 'big_sky__show_component' );
		} );
	} );

	describe( 'executeAbility for big_sky__show_component', () => {
		beforeEach( () => {
			installWpDataMock( 'Original Title' );
		} );

		it( 'returns an error when type is missing', async () => {
			const { result } = await toolProvider.executeAbility( 'big_sky__show_component', {} );
			expect( result ).toMatchObject( { success: false } );
			expect( ( result as any ).error ).toMatch( /missing type/ );
		} );

		it( 'returns an error for an unknown component type', async () => {
			const { result } = await toolProvider.executeAbility( 'big_sky__show_component', {
				type: 'nonexistent-picker',
				props: {},
			} );
			expect( result ).toMatchObject( { success: false } );
			expect( ( result as any ).error ).toMatch( /no component registered/ );
		} );

		it( 'returns an agentMessage envelope for a valid title-picker call', async () => {
			const titles = [
				{ title: 'Title 1', explanation: 'a' },
				{ title: 'Title 2', explanation: 'b' },
				{ title: 'Title 3', explanation: 'c' },
			];
			const { result, returnToAgent } = ( await toolProvider.executeAbility(
				'big_sky__show_component',
				{
					type: 'title-picker',
					props: { titles },
					toolCallId: 'call_test_123',
				}
			) ) as any;

			expect( returnToAgent ).toBe( false );
			expect( result.returnToAgent ).toBe( false );
			expect( typeof result.agentMessage ).toBe( 'string' );

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.tool_id ).toBe( 'big_sky__show_component' );
			expect( parsed.data.type ).toBe( 'title-picker' );
			expect( parsed.data.props ).toEqual( { titles } );
			expect( parsed.data.postId ).toBeUndefined();
			expect( parsed.data.calypsoCheckpointId ).toBe( 'call_test_123' );
			expect( parsed.data.isCurrent ).toBe( true );
			expect( parsed.data.hideZoomAction ).toBe( true );
		} );

		it( 'does not attach a title checkpoint to review-mediation components', async () => {
			const { result } = ( await toolProvider.executeAbility( 'big_sky__show_component', {
				type: 'review-mediation',
				props: {
					summary: 'Summary.',
					conflicts: [],
					implications: [],
					suggested_edits: [],
					guideline_violations: [],
				},
				toolCallId: 'call_review_mediation_123',
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.data.type ).toBe( 'review-mediation' );
			expect( parsed.data.calypsoCheckpointId ).toBeUndefined();
			expect( parsed.data.isCurrent ).toBe( true );
			expect( parsed.data.hideZoomAction ).toBe( true );
			expect( parsed.data.postId ).toBe( 123 );
			expect( parsed.data.props.postId ).toBe( 123 );
		} );

		it( 'does not stamp review-mediation components without a saved editor post ID', async () => {
			installWpDataMock( 'Original Title', 0 );

			const { result } = ( await toolProvider.executeAbility( 'big_sky__show_component', {
				type: 'review-mediation',
				props: {
					summary: 'Summary.',
					conflicts: [],
					implications: [],
					suggested_edits: [],
					guideline_violations: [],
				},
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.data.type ).toBe( 'review-mediation' );
			expect( parsed.data.postId ).toBeUndefined();
			expect( parsed.data.props.postId ).toBeUndefined();
		} );

		it( 'generates a checkpointId fallback when toolCallId is missing', async () => {
			const { result } = ( await toolProvider.executeAbility( 'big_sky__show_component', {
				type: 'title-picker',
				props: { titles: [ { title: 'x' } ] },
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( typeof parsed.data.calypsoCheckpointId ).toBe( 'string' );
			expect( parsed.data.calypsoCheckpointId.length ).toBeGreaterThan( 0 );
		} );
	} );
} );

describe( 'useCheckpoint', () => {
	beforeEach( () => {
		installWpDataMock( 'Original Title' );
	} );

	it( 'snapshots the post title on setCheckpoint and restores it on restoreCheckpoint', async () => {
		const api = useCheckpoint();

		// Snapshot original.
		api.setCheckpoint( 'cp-1' );
		expect( api.hasCheckpoint( 'cp-1' ) ).toBe( true );

		// Change title.
		( window as any ).wp.data.dispatch( 'core/editor' ).editPost( { title: 'New Title' } );
		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' )
		).toBe( 'New Title' );

		// Restore.
		await api.restoreCheckpoint( 'cp-1' );
		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' )
		).toBe( 'Original Title' );
	} );

	it( 'keeps the checkpoint after restore so Undo can be used repeatedly', async () => {
		const api = useCheckpoint();
		api.setCheckpoint( 'cp-2' );

		( window as any ).wp.data.dispatch( 'core/editor' ).editPost( { title: 'Try 1' } );
		await api.restoreCheckpoint( 'cp-2' );
		expect( api.hasCheckpoint( 'cp-2' ) ).toBe( true );

		( window as any ).wp.data.dispatch( 'core/editor' ).editPost( { title: 'Try 2' } );
		await api.restoreCheckpoint( 'cp-2' );
		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' )
		).toBe( 'Original Title' );
	} );

	it( 'removes the checkpoint when clearCheckpoint is called', () => {
		const api = useCheckpoint();
		api.setCheckpoint( 'cp-3' );
		expect( api.hasCheckpoint( 'cp-3' ) ).toBe( true );
		api.clearCheckpoint( 'cp-3' );
		expect( api.hasCheckpoint( 'cp-3' ) ).toBe( false );
	} );

	it( 'hasCheckpoint returns false for unknown ids', () => {
		const api = useCheckpoint();
		expect( api.hasCheckpoint( 'never-set' ) ).toBe( false );
	} );
} );

// Minimal wp.data mock covering both core/editor (for checkpoint) and
// core/block-editor (for updateBlockAttributes / getBlock). Tracks calls so
// tests can assert exact dispatches.
function installWpDataMockWithBlockEditor(
	blocks: Record<
		string,
		{ name: string; attributes: { content?: string }; innerBlocks?: any[] }
	> = {
		'550e8400-e29b-41d4-a716-446655440000': {
			name: 'core/paragraph',
			attributes: { content: 'original block content' },
		},
	}
) {
	const editorState: { title: string } = { title: 'original' };
	const blockUpdates: Array< { clientId: string; attrs: Record< string, unknown > } > = [];
	const selectedClientIds: string[] = [];
	( window as any ).wp = {
		data: {
			select: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						getEditedPostAttribute: ( attr: string ) =>
							attr === 'title' ? editorState.title : undefined,
					};
				}
				if ( store === 'core/block-editor' ) {
					return {
						getBlock: ( clientId: string ) =>
							blocks[ clientId ] ? { clientId, ...blocks[ clientId ] } : null,
						getBlocks: () =>
							Object.entries( blocks ).map( ( [ clientId, block ] ) => ( {
								clientId,
								...block,
							} ) ),
					};
				}
				return undefined;
			},
			dispatch: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						editPost: ( attrs: { title?: string } ) => {
							if ( typeof attrs.title === 'string' ) {
								editorState.title = attrs.title;
							}
						},
					};
				}
				if ( store === 'core/block-editor' ) {
					return {
						updateBlockAttributes: ( clientId: string, attrs: Record< string, unknown > ) => {
							blockUpdates.push( { clientId, attrs } );
							if ( blocks[ clientId ] ) {
								blocks[ clientId ].attributes = {
									...blocks[ clientId ].attributes,
									...attrs,
								};
							}
						},
						selectBlock: ( clientId: string ) => {
							selectedClientIds.push( clientId );
						},
					};
				}
				return undefined;
			},
		},
	};
	return { editorState, blockUpdates, blocks, selectedClientIds };
}

describe( 'applyReviewEdit', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
		document.body.innerHTML = '';
	} );

	it( 'dispatches updateBlockAttributes with the suggested content', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor();
		const addMessage = jest.fn();
		useAbilitiesSetup( {
			addMessage,
			clearSuggestions: () => undefined,
		} as any );

		const promise = applyReviewEdit( '550e8400-e29b-41d4-a716-446655440000', 'new text' );
		// handleUpdateBlockContent uses an 800ms setTimeout before committing.
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: true,
			contentBefore: 'original block content',
			contentAfter: 'new text',
		} );
		expect( blockUpdates ).toEqual( [
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { content: 'new text' },
			},
		] );
	} );

	it( 'does not snapshot or write when shouldApply is already false', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor();
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );

		const result = await applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'new text',
			undefined,
			undefined,
			() => false
		);

		expect( result ).toMatchObject( {
			success: false,
			error: 'context changed',
		} );
		expect( blockUpdates ).toEqual( [] );
	} );

	it( 'does not write and clears processing state when shouldApply turns false before the delayed write', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor();
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );
		const blockEl = document.createElement( 'div' );
		blockEl.setAttribute( 'data-block', '550e8400-e29b-41d4-a716-446655440000' );
		document.body.appendChild( blockEl );
		let shouldApply = true;

		const promise = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'new text',
			undefined,
			undefined,
			() => shouldApply
		);
		expect( blockEl.classList.contains( 'jetpack-ai-is-processing' ) ).toBe( true );

		shouldApply = false;
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: false,
			error: 'context changed',
		} );
		expect( blockUpdates ).toEqual( [] );
		expect( blockEl.classList.contains( 'jetpack-ai-is-processing' ) ).toBe( false );
	} );

	it( 'returns the rationale as an agent message so AM can attach feedback actions', async () => {
		installWpDataMockWithBlockEditor();
		const addMessage = jest.fn();
		useAbilitiesSetup( {
			addMessage,
			clearSuggestions: () => undefined,
		} as any );

		const promise = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'new text',
			'Follows Copy guideline on specific dates.'
		);
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( addMessage ).not.toHaveBeenCalled();
		expect( result.agentMessage ).toBe( 'Follows Copy guideline on specific dates.' );
	} );

	it( 'does not emit a chat message when summary is omitted', async () => {
		installWpDataMockWithBlockEditor();
		const addMessage = jest.fn();
		useAbilitiesSetup( {
			addMessage,
			clearSuggestions: () => undefined,
		} as any );

		const promise = applyReviewEdit( '550e8400-e29b-41d4-a716-446655440000', 'only-content' );
		jest.advanceTimersByTime( 1000 );
		await promise;

		expect( addMessage ).not.toHaveBeenCalled();
	} );

	it( 'supports repeated edits against the updated selected block content', async () => {
		const { blockUpdates, selectedClientIds } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/paragraph',
				attributes: { content: 'hello world this is my firsst post' },
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );

		const first = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'Hello world, this is my first post.',
			undefined,
			'hello world this is my firsst post'
		);
		jest.advanceTimersByTime( 1000 );
		await first;

		const second = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'Hello world, this is my first post!',
			undefined,
			'Hello world, this is my first post.'
		);
		jest.advanceTimersByTime( 1000 );
		const result = await second;

		expect( result ).toMatchObject( {
			success: true,
			contentBefore: 'Hello world, this is my first post.',
			contentAfter: 'Hello world, this is my first post!',
		} );
		expect( blockUpdates ).toEqual( [
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { content: 'Hello world, this is my first post.' },
			},
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { content: 'Hello world, this is my first post!' },
			},
		] );
		expect( selectedClientIds ).toEqual( [
			'550e8400-e29b-41d4-a716-446655440000',
			'550e8400-e29b-41d4-a716-446655440000',
		] );
	} );

	// Intentionally no direct unit test for the `setCheckpoint` call inside
	// applyReviewEdit: `useCheckpoint()` spreads its api into a fresh object
	// (`{ ...api }`), so `jest.spyOn(useCheckpoint(), 'setCheckpoint')` would
	// wrap the returned copy rather than the module-level singleton that
	// applyReviewEdit actually invokes. The checkpoint API's own behaviour is
	// covered by the `useCheckpoint` describe block below.

	it( 'replaces only the matching span when currentText is provided', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/paragraph',
				attributes: { content: 'The board voted last Tuesday on the proposal.' },
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );

		const promise = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'voted on Tuesday',
			undefined,
			'voted last Tuesday'
		);
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			contentBefore: 'The board voted last Tuesday on the proposal.',
			contentAfter: 'The board voted on Tuesday on the proposal.',
		} );

		expect( blockUpdates ).toEqual( [
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { content: 'The board voted on Tuesday on the proposal.' },
			},
		] );
	} );

	it( 'falls back to a unique currentText match when the clientId is stale', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'live-client-id': {
				name: 'core/paragraph',
				attributes: { content: 'hello world this is my firsst post' },
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		const promise = applyReviewEdit(
			'stale-client-id',
			'Hello world, this is my first post.',
			undefined,
			'hello world this is my firsst post'
		);
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: true,
			clientId: 'live-client-id',
			contentBefore: 'hello world this is my firsst post',
			contentAfter: 'Hello world, this is my first post.',
		} );
		expect( blockUpdates ).toEqual( [
			{
				clientId: 'live-client-id',
				attrs: { content: 'Hello world, this is my first post.' },
			},
		] );
		warn.mockRestore();
	} );

	it( 'revalidates currentText against the latest block content before writing', async () => {
		const { blockUpdates, blocks } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/paragraph',
				attributes: { content: 'The board voted last Tuesday on the proposal.' },
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );

		const promise = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'voted on Tuesday',
			undefined,
			'voted last Tuesday'
		);
		blocks[ '550e8400-e29b-41d4-a716-446655440000' ].attributes.content =
			'Updated intro. The board voted last Tuesday on the proposal.';
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: true,
			contentBefore: 'Updated intro. The board voted last Tuesday on the proposal.',
			contentAfter: 'Updated intro. The board voted on Tuesday on the proposal.',
		} );
		expect( blockUpdates ).toEqual( [
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { content: 'Updated intro. The board voted on Tuesday on the proposal.' },
			},
		] );
	} );

	it( 'fails safely when currentText disappears before the delayed write', async () => {
		const { blockUpdates, blocks } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/paragraph',
				attributes: { content: 'The board voted last Tuesday on the proposal.' },
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		const promise = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'voted on Tuesday',
			undefined,
			'voted last Tuesday'
		);
		blocks[ '550e8400-e29b-41d4-a716-446655440000' ].attributes.content =
			'The board voted yesterday on the proposal.';
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: false,
			error: 'currentText not found in block content',
		} );
		expect( blockUpdates ).toEqual( [] );
		expect( warn ).toHaveBeenCalledWith(
			'[ReviewMediation] currentText not found in block content',
			{ clientId: '550e8400-e29b-41d4-a716-446655440000' }
		);
		warn.mockRestore();
	} );

	it( 'fails without replacing the block when currentText is not present in the block', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/paragraph',
				attributes: { content: 'Unrelated paragraph content.' },
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );

		const promise = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'replacement text',
			undefined,
			'span that is not in the block'
		);
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: false,
			error: 'currentText not found in block content',
		} );
		expect( blockUpdates ).toEqual( [] );
		expect( warn ).toHaveBeenCalledWith(
			'[ReviewMediation] currentText not found in block content',
			{ clientId: '550e8400-e29b-41d4-a716-446655440000' }
		);
		warn.mockRestore();
	} );

	it.each( [
		[ 'separate matches', 'vote now, then vote again after discussion.', 'vote' ],
		[ 'overlapping matches', 'banana', 'ana' ],
	] )(
		'fails without replacing the block when currentText has %s',
		async ( _label, content, currentText ) => {
			const { blockUpdates } = installWpDataMockWithBlockEditor( {
				'550e8400-e29b-41d4-a716-446655440000': {
					name: 'core/paragraph',
					attributes: { content },
				},
			} );
			useAbilitiesSetup( {
				addMessage: () => undefined,
				clearSuggestions: () => undefined,
			} as any );
			const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );

			const promise = applyReviewEdit(
				'550e8400-e29b-41d4-a716-446655440000',
				'cast a ballot',
				undefined,
				currentText
			);
			jest.advanceTimersByTime( 1000 );
			const result = await promise;

			expect( result ).toMatchObject( {
				success: false,
				error: 'currentText matches multiple spans in block content',
			} );
			expect( blockUpdates ).toEqual( [] );
			expect( warn ).toHaveBeenCalledWith(
				'[ReviewMediation] currentText matches multiple spans in block content',
				{ clientId: '550e8400-e29b-41d4-a716-446655440000' }
			);
			warn.mockRestore();
		}
	);

	it( 'fails safely on unsupported block types', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/list',
				attributes: { content: 'A list item.' },
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );

		const promise = applyReviewEdit( '550e8400-e29b-41d4-a716-446655440000', 'new text' );
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( { success: false } );
		expect( blockUpdates ).toEqual( [] );
	} );

	it( 'returns an error result when clientId is missing', async () => {
		installWpDataMockWithBlockEditor();
		useAbilitiesSetup( {
			addMessage: () => undefined,
			clearSuggestions: () => undefined,
		} as any );

		const promise = applyReviewEdit( '', 'new text' );
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( { success: false } );
	} );

	it( 'undoBlockEdit restores only when the expected content still matches', () => {
		const { blockUpdates, blocks } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/paragraph',
				attributes: { content: 'The board voted on Tuesday.' },
			},
		} );

		const restored = undoBlockEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'The board voted last Tuesday.',
			'The board voted on Tuesday.'
		);

		expect( restored ).toBe( true );
		expect( blockUpdates ).toEqual( [
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { content: 'The board voted last Tuesday.' },
			},
		] );

		blocks[ '550e8400-e29b-41d4-a716-446655440000' ].attributes.content =
			'The board voted on Wednesday.';

		const blocked = undoBlockEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'The board voted last Tuesday.',
			'The board voted on Tuesday.'
		);

		expect( blocked ).toBe( false );
		expect( blockUpdates ).toHaveLength( 1 );
	} );
} );

describe( 'findBlockElement', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'returns the element with matching data-block attribute in the main document', () => {
		const el = document.createElement( 'div' );
		el.setAttribute( 'data-block', '550e8400-e29b-41d4-a716-446655440000' );
		document.body.appendChild( el );
		expect( findBlockElement( '550e8400-e29b-41d4-a716-446655440000' ) ).toBe( el );
	} );

	it( 'supports short mixed-case Gutenberg clientIds', () => {
		const el = document.createElement( 'div' );
		el.setAttribute( 'data-block', 'lQ0k' );
		document.body.appendChild( el );
		expect( findBlockElement( 'lQ0k' ) ).toBe( el );
	} );

	it( 'returns null when the clientId is not in the DOM', () => {
		// Returns null from the regex guard, the main-doc querySelector miss,
		// or the optional editor-canvas iframe lookup chain (coerced via ?? null).
		expect( findBlockElement( '550e8400-e29b-41d4-a716-446655440001' ) ).toBeNull();
	} );

	it( 'escapes clientIds to prevent selector injection', () => {
		const el = document.createElement( 'div' );
		el.setAttribute( 'data-block', 'client.id' );
		document.body.appendChild( el );
		expect( findBlockElement( 'client.id' ) ).toBe( el );
		expect( findBlockElement( '"][onerror="alert(1)"]' ) ).toBeNull();
		expect( findBlockElement( 'contains space' ) ).toBeNull();
	} );

	it( 'finds blocks in accessible editor iframes', () => {
		const iframe = document.createElement( 'iframe' );
		document.body.appendChild( iframe );
		const el = iframe.contentDocument?.createElement( 'div' );
		el?.setAttribute( 'data-block', 'lQ0k' );
		iframe.contentDocument?.body.appendChild( el as HTMLElement );
		expect( findBlockElement( 'lQ0k' ) ).toBe( el );
	} );
} );

describe( 'findBlockListLayout', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'finds the root block-list layout element in the main document', () => {
		const el = document.createElement( 'div' );
		el.className = 'block-editor-block-list__layout is-root-container';
		document.body.appendChild( el );
		expect( findBlockListLayout() ).toBe( el );
	} );

	it( 'returns null when the root layout is not in the DOM', () => {
		// Returns null from the main-doc querySelector miss or the optional
		// editor-canvas iframe lookup chain (coerced via ?? null).
		expect( findBlockListLayout() ).toBeNull();
	} );

	it( 'ignores layout elements that are not the root container', () => {
		// Nested (non-root) block lists appear inside group blocks and must
		// not be matched — we only toggle focus mode on the editor's root.
		const nested = document.createElement( 'div' );
		nested.className = 'block-editor-block-list__layout';
		document.body.appendChild( nested );
		expect( findBlockListLayout() ).toBeFalsy();
	} );
} );
