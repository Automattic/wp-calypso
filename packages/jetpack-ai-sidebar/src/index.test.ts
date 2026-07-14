/**
 * Tests for the Jetpack AI Sidebar provider.
 *
 * Focused on the show-component flow, the checkpoint hook, and the
 * getChatComponent resolver — these are the pieces AM wires into its chat.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import ExcerptPicker from './components/excerpt-picker';
import ImageAltTextPicker from './components/image-alt-text-picker';
import PostFeedback from './components/post-feedback';
import Proofread from './components/proofread';
import ReviewMediation from './components/review-mediation';
import SeoDescriptionPicker from './components/seo-description-picker';
import SeoTitlePicker from './components/seo-title-picker';
import TitlePicker from './components/title-picker';
import { clearActiveBlockFocus, undoBlockEdit } from './utils/block-actions';
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

Element.prototype.scrollIntoView = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( './extensions', () => ( {
	registerBlockEditorFilters: jest.fn(),
} ) );

const mockSetIsSplitScreen = jest.fn();
let mockSelectedBlockClientId: string | null = null;
const mockSelectBlock = jest.fn( ( clientId?: string | null ) => {
	mockSelectedBlockClientId = clientId ?? null;
} );
const mockClearSelectedBlock = jest.fn( () => {
	mockSelectedBlockClientId = null;
} );
const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;
let mockSelectedBlock: any = null;
let mockCurrentPostType: string | undefined = 'post';
let mockBlocksByClientId: Record< string, any > = {};
let mockEditorBlocks: any[] = [];
const SHOW_COMPONENT_TOOL_ID = 'jetpack_ai__show_component';
const LEGACY_SHOW_COMPONENT_TOOL_ID = 'big_sky__show_component';

function appendRootBlockListLayout( doc: Document = document ): HTMLElement {
	const layout = doc.createElement( 'div' );
	layout.className = 'block-editor-block-list__layout is-root-container';
	doc.body.appendChild( layout );
	return layout;
}

function appendBlockInRootLayout(
	clientId: string,
	doc: Document = document
): { layout: HTMLElement; block: HTMLElement } {
	const layout = appendRootBlockListLayout( doc );
	const block = doc.createElement( 'div' );
	block.setAttribute( 'data-block', clientId );
	layout.appendChild( block );
	return { layout, block };
}

jest.mock( '@wordpress/block-editor', () => ( {
	store: 'core/block-editor',
} ) );

jest.mock( '@wordpress/components', () => {
	const react = jest.requireActual< typeof import('react') >( 'react' );
	return {
		Panel: ( { children }: any ) => react.createElement( 'div', null, children ),
		PanelBody: ( { children, initialOpen, title }: any ) =>
			react.createElement(
				'section',
				{ 'data-initial-open': initialOpen ? 'true' : 'false' },
				react.createElement( 'h3', null, title ),
				children
			),
	};
} );

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn( ( store: string ) => {
		if ( store === 'automattic/agents-manager' ) {
			return { setIsSplitScreen: mockSetIsSplitScreen };
		}
		if ( store === 'core/block-editor' ) {
			return {
				selectBlock: mockSelectBlock,
				clearSelectedBlock: mockClearSelectedBlock,
			};
		}
		return {};
	} ),
	select: jest.fn( ( store: string ) => {
		if ( store === 'core/block-editor' ) {
			return {
				getSelectedBlockClientId: () => mockSelectedBlockClientId,
			};
		}
		return {};
	} ),
	useDispatch: () => ( {
		editPost: jest.fn(),
		selectBlock: mockSelectBlock,
	} ),
	useSelect: ( fn: any ) =>
		fn( ( store: string ) => {
			if ( store === 'core/block-editor' ) {
				return {
					getSelectedBlock: () => mockSelectedBlock,
					getBlock: ( clientId: string ) => mockBlocksByClientId[ clientId ],
					getBlocks: () => mockEditorBlocks,
				};
			}
			if ( store === 'core/editor' ) {
				return {
					getCurrentPostId: () => 123,
					getCurrentPostType: () => mockCurrentPostType,
				};
			}
			return {};
		} ),
} ) );

// Stub @wordpress/data on window so useCheckpoint / handleShowComponent
// can read/write the post title and current post id via the core/editor store.
function installWpDataMock( initialTitle: string, postId = 123, initialExcerpt = '' ) {
	const state = { title: initialTitle, excerpt: initialExcerpt };
	( window as any ).wp = {
		data: {
			select: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						getCurrentPostId: () => postId,
						getEditedPostAttribute: ( attr: string ) => {
							if ( attr === 'title' ) {
								return state.title;
							}
							if ( attr === 'excerpt' ) {
								return state.excerpt;
							}
							return undefined;
						},
					};
				}
				return undefined;
			},
			dispatch: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						editPost: ( attrs: { title?: string; excerpt?: string } ) => {
							if ( typeof attrs.title === 'string' ) {
								state.title = attrs.title;
							}
							if ( typeof attrs.excerpt === 'string' ) {
								state.excerpt = attrs.excerpt;
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

function installPostTypeMock(
	postType?: string,
	postId: number | null = 123,
	supportsExcerpt: boolean = postType === 'post',
	postTypeRecordResolved = true
) {
	( window as any ).wp = {
		data: {
			select: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						getCurrentPostId: () => postId,
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
				if ( store === 'core' ) {
					return {
						getPostType: ( name: string ) =>
							postTypeRecordResolved && name === postType
								? { supports: { excerpt: supportsExcerpt } }
								: undefined,
					};
				}
				return undefined;
			},
		},
	};
}

function installContextProviderMock( postType = 'post', postId: number | null = 123 ) {
	const blocks = [
		{
			name: 'core/paragraph',
			clientId: 'context-block',
			attributes: { content: 'Unsaved editor text' },
			innerBlocks: [],
		},
	];
	( window as any ).wp = {
		data: {
			select: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						getCurrentPostId: () => postId,
						getCurrentPostType: () => postType,
					};
				}
				if ( store === 'core/block-editor' ) {
					return {
						getSelectedBlock: () => null,
						getBlock: ( clientId: string ) =>
							blocks.find( ( block ) => block.clientId === clientId ),
						getBlocks: () => blocks,
					};
				}
				return undefined;
			},
		},
	};
	return blocks;
}

function installAiEditorialReviewData( features: Record< string, boolean > = {} ) {
	( globalThis as any ).agentsManagerData = {
		jetpackAiSidebar: {
			enabled: true,
			features: {
				aiEditorialReview: true,
				generateFeedback: true,
				blockTransformations: true,
				optimizeTitleSuggestion: false,
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

describe( 'contextProvider.getClientContext', () => {
	afterEach( () => {
		delete ( globalThis as any ).agentsManagerData;
	} );

	it( 'forwards jetpackSEOSuggestionsEnabled = true when the host enables SEO suggestions', () => {
		installAiEditorialReviewData( { seoSuggestions: true } );
		expect( contextProvider.getClientContext().jetpackSEOSuggestionsEnabled ).toBe( true );
	} );

	it( 'forwards jetpackSEOSuggestionsEnabled = false when the host disables SEO suggestions', () => {
		installAiEditorialReviewData( { seoSuggestions: false } );
		expect( contextProvider.getClientContext().jetpackSEOSuggestionsEnabled ).toBe( false );
	} );

	it( 'defaults jetpackSEOSuggestionsEnabled to false when no sidebar config is present', () => {
		expect( contextProvider.getClientContext().jetpackSEOSuggestionsEnabled ).toBe( false );
	} );
} );

describe( 'getChatComponent', () => {
	it( 'returns TitlePicker for type "title-picker"', () => {
		expect( getChatComponent( 'title-picker' ) ).toBe( TitlePicker );
	} );

	it( 'returns ReviewMediation for type "review-mediation"', () => {
		expect( getChatComponent( 'review-mediation' ) ).toBe( ReviewMediation );
	} );

	it( 'returns PostFeedback for type "post-feedback"', () => {
		expect( getChatComponent( 'post-feedback' ) ).toBe( PostFeedback );
	} );

	it( 'returns Proofread for type "proofread"', () => {
		expect( getChatComponent( 'proofread' ) ).toBe( Proofread );
	} );

	it( 'returns SeoTitlePicker for type "seo-title-picker"', () => {
		expect( getChatComponent( 'seo-title-picker' ) ).toBe( SeoTitlePicker );
	} );

	it( 'returns SeoDescriptionPicker for type "seo-description-picker"', () => {
		expect( getChatComponent( 'seo-description-picker' ) ).toBe( SeoDescriptionPicker );
	} );

	it( 'returns ImageAltTextPicker for type "image-alt-text-picker"', () => {
		expect( getChatComponent( 'image-alt-text-picker' ) ).toBe( ImageAltTextPicker );
	} );

	it( 'returns ExcerptPicker for type "excerpt-picker"', () => {
		expect( getChatComponent( 'excerpt-picker' ) ).toBe( ExcerptPicker );
	} );

	it( 'returns null for an unknown type', () => {
		expect( getChatComponent( 'font-picker' ) ).toBeNull();
		expect( getChatComponent( '' ) ).toBeNull();
		expect( getChatComponent( 'anything-else' ) ).toBeNull();
	} );
} );

describe( 'PostFeedback', () => {
	beforeEach( () => {
		mockEditorBlocks = [];
		mockSelectedBlockClientId = null;
		mockSelectBlock.mockClear();
		mockClearSelectedBlock.mockClear();
		document.body.innerHTML = '';
		clearActiveBlockFocus();
		mockClearSelectedBlock.mockClear();
		delete ( window as any ).wp;
	} );

	it( 'renders backend flat feedback items', () => {
		const { container } = render(
			React.createElement( PostFeedback, {
				summary: 'The post needs a clearer activity line before publishing.',
				postId: 123,
				items: [
					{
						title: 'Fix duplicated punctuation',
						feedback: 'The activity sentence has duplicated punctuation.',
						action: 'Replace the sentence with cleaner wording.',
						block_index: 0,
						current_text: 'There will be a lot of activities for children..',
						suggested_text: 'There will be activities for children.',
					},
					{
						title: 'Add missing event details',
						feedback: 'The announcement would be more useful with confirmed event details.',
						action: 'Add the time, venue, and registration details once confirmed.',
						block_index: null,
						requires_manual: true,
						manual_reason: 'Needs confirmed event details from the author.',
					},
				],
			} )
		);

		expect( container.textContent ).toContain( 'The post needs a clearer activity line' );
		expect( container.textContent ).toContain( 'Summary' );
		expect( container.textContent ).toContain( 'Feedback' );
		expect( container.textContent ).toContain( 'Fix duplicated punctuation' );
		expect( container.textContent ).toContain( 'Suggested rewrite' );
		expect( container.textContent ).toContain(
			'Needs manual edit: Needs confirmed event details from the author.'
		);
		const manualReasons = container.querySelectorAll( '.jetpack-ai-feedback-list__manual-reason' );
		const acceptButtons = container.querySelectorAll(
			'.jetpack-ai-feedback-list__action-button.is-primary'
		);
		expect( acceptButtons[ 1 ].hasAttribute( 'disabled' ) ).toBe( true );
		expect( acceptButtons[ 1 ].getAttribute( 'aria-describedby' ) ).toBe(
			manualReasons[ 1 ]?.getAttribute( 'id' )
		);
	} );

	it( 'does not duplicate the manual edit label when no manual reason is provided', () => {
		const { container } = render(
			React.createElement( PostFeedback, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Manual item',
						feedback: 'Feedback.',
						action: 'Action.',
						block_index: null,
						requires_manual: true,
					},
				],
			} )
		);

		expect( container.textContent ).toContain(
			'Needs manual edit: This item cannot be applied automatically.'
		);
		expect( container.textContent ).not.toContain( 'Needs manual edit: Needs manual edit.' );
	} );

	it( 'marks the item failed when the block editor store cannot apply the edit', async () => {
		mockEditorBlocks = [
			{
				clientId: 'block-1',
				name: 'core/paragraph',
				attributes: { content: 'Original paragraph text.' },
			},
		];
		( window as any ).wp = {
			data: {
				select: ( store: string ) =>
					store === 'core/editor' ? { getCurrentPostId: () => 123 } : undefined,
				dispatch: ( store: string ) => {
					if ( store === 'core/block-editor' ) {
						throw new Error( 'missing block editor store' );
					}
					return undefined;
				},
			},
		};

		const { container } = render(
			React.createElement( PostFeedback, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Apply item',
						feedback: 'Feedback.',
						action: 'Action.',
						block_index: 0,
						current_text: 'Original paragraph text.',
						suggested_text: 'Updated paragraph text.',
					},
				],
			} )
		);
		const acceptButton = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => button.textContent === 'Accept'
		);
		expect( acceptButton ).toBeDefined();

		await act( async () => {
			fireEvent.click( acceptButton as HTMLButtonElement );
			await Promise.resolve();
		} );

		expect( container.textContent ).toContain( 'Retry' );
		expect( container.textContent ).toContain( 'Could not apply this rewrite.' );
	} );

	it( 'explains when a referenced block has no editable text target', () => {
		mockEditorBlocks = [
			{
				clientId: 'block-1',
				name: 'core/query',
				attributes: { queryId: 1 },
			},
		];

		const { container } = render(
			React.createElement( PostFeedback, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Unsupported block item',
						feedback: 'Feedback.',
						action: 'Action.',
						block_index: 0,
						current_text: 'Original list content.',
						suggested_text: 'Updated list content.',
					},
				],
			} )
		);

		expect( container.textContent ).toContain( 'Needs manual edit - unsupported edit target.' );
		const acceptButton = Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => button.textContent === 'Accept'
		);
		expect( acceptButton?.hasAttribute( 'disabled' ) ).toBe( true );
	} );

	it( 'toggles sidebar-owned block focus from the referenced block', () => {
		mockEditorBlocks = [
			{
				clientId: 'block-1',
				name: 'core/paragraph',
				attributes: { content: 'The paragraph to focus.' },
			},
		];
		const unrelatedLayout = appendRootBlockListLayout();
		const { layout: layoutElement, block: blockElement } = appendBlockInRootLayout( 'block-1' );

		const { unmount } = render(
			React.createElement( PostFeedback, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Focus item',
						feedback: 'Feedback.',
						action: 'Action.',
						block_index: 0,
						current_text: '',
						suggested_text: '',
						requires_manual: true,
						manual_reason: 'Needs manual edit.',
					},
				],
			} )
		);

		const blockRef = document.querySelector( '.jetpack-ai-feedback-list__block-ref' );
		expect( blockRef ).toBeTruthy();
		( blockRef as HTMLButtonElement ).click();

		expect( mockSelectBlock ).toHaveBeenCalledWith( 'block-1' );
		expect( blockElement.scrollIntoView ).toHaveBeenCalledWith( {
			behavior: 'smooth',
			block: 'center',
		} );
		expect( layoutElement.classList.contains( 'is-focus-mode' ) ).toBe( true );
		expect( unrelatedLayout.classList.contains( 'is-focus-mode' ) ).toBe( false );

		( blockRef as HTMLButtonElement ).click();

		expect( mockClearSelectedBlock ).toHaveBeenCalled();
		expect( layoutElement.classList.contains( 'is-focus-mode' ) ).toBe( false );

		unmount();

		expect( mockClearSelectedBlock ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'moves sidebar-owned block focus between referenced blocks', () => {
		mockEditorBlocks = [
			{
				clientId: 'block-1',
				name: 'core/paragraph',
				attributes: { content: 'The first paragraph to focus.' },
			},
			{
				clientId: 'block-2',
				name: 'core/paragraph',
				attributes: { content: 'The second paragraph to focus.' },
			},
		];
		const { layout: firstLayout } = appendBlockInRootLayout( 'block-1' );
		const { layout: secondLayout } = appendBlockInRootLayout( 'block-2' );

		const { container } = render(
			React.createElement( PostFeedback, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'First focus item',
						feedback: 'Feedback.',
						action: 'Action.',
						block_index: 0,
						current_text: '',
						suggested_text: '',
					},
					{
						title: 'Second focus item',
						feedback: 'Feedback.',
						action: 'Action.',
						block_index: 1,
						current_text: '',
						suggested_text: '',
					},
				],
			} )
		);

		const blockRefs = container.querySelectorAll( '.jetpack-ai-feedback-list__block-ref' );
		( blockRefs[ 0 ] as HTMLButtonElement ).click();
		expect( firstLayout.classList.contains( 'is-focus-mode' ) ).toBe( true );
		expect( secondLayout.classList.contains( 'is-focus-mode' ) ).toBe( false );
		mockClearSelectedBlock.mockClear();

		( blockRefs[ 1 ] as HTMLButtonElement ).click();

		expect( mockClearSelectedBlock ).toHaveBeenCalled();
		expect( mockSelectBlock ).toHaveBeenLastCalledWith( 'block-2' );
		expect( firstLayout.classList.contains( 'is-focus-mode' ) ).toBe( false );
		expect( secondLayout.classList.contains( 'is-focus-mode' ) ).toBe( true );
	} );

	it( 'clears sidebar-owned block focus on unmount', () => {
		mockEditorBlocks = [
			{
				clientId: 'block-1',
				name: 'core/paragraph',
				attributes: { content: 'The paragraph to focus.' },
			},
		];
		const { layout: layoutElement } = appendBlockInRootLayout( 'block-1' );

		const { container, unmount } = render(
			React.createElement( PostFeedback, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Focus item',
						feedback: 'Feedback.',
						action: 'Action.',
						block_index: 0,
						current_text: '',
						suggested_text: '',
						requires_manual: true,
						manual_reason: 'Needs manual edit.',
					},
				],
			} )
		);

		(
			container.querySelector( '.jetpack-ai-feedback-list__block-ref' ) as HTMLButtonElement
		 ).click();
		expect( layoutElement.classList.contains( 'is-focus-mode' ) ).toBe( true );

		unmount();

		expect( mockClearSelectedBlock ).toHaveBeenCalled();
		expect( layoutElement.classList.contains( 'is-focus-mode' ) ).toBe( false );
	} );

	it( 'clears sidebar-owned block focus on non-block-reference sidebar clicks', () => {
		mockEditorBlocks = [
			{
				clientId: 'block-1',
				name: 'core/paragraph',
				attributes: { content: 'The paragraph to focus.' },
			},
		];
		const layoutElement = appendRootBlockListLayout();

		const { container } = render(
			React.createElement( PostFeedback, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Focus item',
						feedback: 'Feedback.',
						action: 'Action.',
						block_index: 0,
						current_text: '',
						suggested_text: '',
						requires_manual: true,
						manual_reason: 'Needs manual edit.',
					},
				],
			} )
		);

		(
			container.querySelector( '.jetpack-ai-feedback-list__block-ref' ) as HTMLButtonElement
		 ).click();
		expect( layoutElement.classList.contains( 'is-focus-mode' ) ).toBe( true );
		mockClearSelectedBlock.mockClear();

		const dismissButton = container.querySelectorAll(
			'.jetpack-ai-feedback-list__action-button'
		)[ 1 ] as HTMLButtonElement;
		fireEvent.mouseDown( dismissButton );
		act( () => {
			dismissButton.click();
		} );

		expect( mockClearSelectedBlock ).toHaveBeenCalled();
		expect( layoutElement.classList.contains( 'is-focus-mode' ) ).toBe( false );
	} );

	it( 'opens every section by default when sectioned feedback is provided', () => {
		const { container } = render(
			React.createElement( PostFeedback, {
				summary: 'Summary.',
				postId: 123,
				sections: [
					{
						title: 'First section',
						items: [
							{
								title: 'First item',
								feedback: 'Feedback.',
								action: 'Action.',
								block_index: null,
								requires_manual: true,
								manual_reason: 'Needs manual edit.',
							},
						],
					},
					{
						title: 'Second section',
						items: [
							{
								title: 'Second item',
								feedback: 'Feedback.',
								action: 'Action.',
								block_index: null,
								requires_manual: true,
								manual_reason: 'Needs manual edit.',
							},
						],
					},
				],
			} )
		);

		expect(
			Array.from( container.querySelectorAll( 'section' ) ).map( ( section ) =>
				section.getAttribute( 'data-initial-open' )
			)
		).toEqual( [ 'true', 'true', 'true' ] );
	} );
} );

describe( 'Proofread', () => {
	beforeEach( () => {
		mockEditorBlocks = [];
		document.body.innerHTML = '';
		clearActiveBlockFocus();
		delete ( window as any ).wp;
	} );

	it( 'renders the summary notes and proofread items', () => {
		const { container } = render(
			React.createElement( Proofread, {
				summary: 'Found a duplicated period.',
				postId: 123,
				items: [
					{
						title: 'Punctuation',
						feedback: 'The sentence ends with a doubled period.',
						action: 'Remove the extra period.',
						block_index: 0,
						current_text: 'children..',
						suggested_text: 'children.',
					},
				],
			} )
		);

		expect( container.textContent ).toContain( 'Found a duplicated period.' );
		expect( container.textContent ).toContain( 'Spelling and grammar check complete.' );
		expect( container.textContent ).toContain( 'Reviews your last saved version.' );
		expect( container.textContent ).toContain( 'Spelling & grammar' );
		expect( container.textContent ).toContain( 'Punctuation' );
	} );

	const findAcceptAllButton = ( container: HTMLElement ) =>
		Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => button.textContent?.startsWith( 'Accept all' )
		);

	it( 'shows an enabled Accept all button when one-click fixes are available', () => {
		mockEditorBlocks = [
			{
				clientId: 'block-1',
				name: 'core/paragraph',
				attributes: { content: 'There will be a lot of activities for children..' },
			},
		];

		const { container } = render(
			React.createElement( Proofread, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Punctuation',
						feedback: 'Doubled period.',
						action: 'Remove the extra period.',
						block_index: 0,
						current_text: 'There will be a lot of activities for children..',
						suggested_text: 'There will be a lot of activities for children.',
					},
				],
			} )
		);

		const acceptAll = findAcceptAllButton( container );
		expect( acceptAll ).toBeTruthy();
		expect( acceptAll?.hasAttribute( 'disabled' ) ).toBe( false );
	} );

	it( 'hides Accept all when no one-click fixes are available', () => {
		const { container } = render(
			React.createElement( Proofread, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Manual item',
						feedback: 'Feedback.',
						action: 'Action.',
						block_index: null,
						requires_manual: true,
						manual_reason: 'Needs author review.',
					},
				],
			} )
		);

		expect( findAcceptAllButton( container ) ).toBeUndefined();
	} );

	const findButtonByText = ( container: HTMLElement, text: string ) =>
		Array.from( container.querySelectorAll( 'button' ) ).find(
			( button ) => button.textContent === text
		) as HTMLButtonElement | undefined;

	it( 'applies pending one-click items and marks them Applied on Accept all', async () => {
		jest.useFakeTimers();
		mockEditorBlocks = [
			{
				clientId: 'block-1',
				name: 'core/paragraph',
				attributes: { content: 'There will be a lot of activities for children..' },
			},
		];
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'block-1': {
				name: 'core/paragraph',
				attributes: { content: 'There will be a lot of activities for children..' },
			},
		} );

		const { container } = render(
			React.createElement( Proofread, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Punctuation',
						feedback: 'Doubled period.',
						action: 'Remove the extra period.',
						block_index: 0,
						current_text: 'There will be a lot of activities for children..',
						suggested_text: 'There will be a lot of activities for children.',
					},
				],
			} )
		);

		const acceptAll = findAcceptAllButton( container ) as HTMLButtonElement;
		await act( async () => {
			fireEvent.click( acceptAll );
		} );
		// applyReviewEdit commits the edit behind an 800ms shimmer delay.
		await act( async () => {
			jest.advanceTimersByTime( 1000 );
		} );

		expect( blockUpdates ).toEqual( [
			{
				clientId: 'block-1',
				attrs: { content: 'There will be a lot of activities for children.' },
			},
		] );
		expect( container.textContent ).toContain( 'Applied' );
		expect( findButtonByText( container, 'Retry' ) ).toBeUndefined();
		jest.useRealTimers();
	} );

	it( 'shows a steady Accepting state while the bulk run is in progress', async () => {
		jest.useFakeTimers();
		mockEditorBlocks = [
			{ clientId: 'block-1', name: 'core/paragraph', attributes: { content: 'children..' } },
		];
		installWpDataMockWithBlockEditor( {
			'block-1': { name: 'core/paragraph', attributes: { content: 'children..' } },
		} );

		const { container } = render(
			React.createElement( Proofread, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'Punctuation',
						feedback: 'Doubled period.',
						action: 'Remove the extra period.',
						block_index: 0,
						current_text: 'children..',
						suggested_text: 'children.',
					},
				],
			} )
		);

		const acceptAll = findAcceptAllButton( container ) as HTMLButtonElement;
		await act( async () => {
			fireEvent.click( acceptAll );
		} );

		// Mid-run the footer stays put with a steady label rather than showing a
		// decrementing "Accept all (N)" count that vanishes as items resolve.
		expect( container.querySelector( '.jetpack-ai-feedback-list__footer' ) ).not.toBeNull();
		expect( container.textContent ).toContain( 'Accepting…' );
		expect( container.textContent ).not.toContain( 'Accept all (' );

		await act( async () => {
			jest.advanceTimersByTime( 1000 );
		} );

		expect( container.textContent ).toContain( 'Applied' );
		expect( findAcceptAllButton( container ) ).toBeUndefined();
		jest.useRealTimers();
	} );

	it( 'disables Undo on applied items during a bulk run', async () => {
		jest.useFakeTimers();
		mockEditorBlocks = [
			{ clientId: 'block-a', name: 'core/paragraph', attributes: { content: 'aa..' } },
			{ clientId: 'block-b', name: 'core/paragraph', attributes: { content: 'bb..' } },
		];
		installWpDataMockWithBlockEditor( {
			'block-a': { name: 'core/paragraph', attributes: { content: 'aa..' } },
			'block-b': { name: 'core/paragraph', attributes: { content: 'bb..' } },
		} );

		const { container } = render(
			React.createElement( Proofread, {
				summary: 'Summary.',
				postId: 123,
				items: [
					{
						title: 'A',
						feedback: 'a',
						action: 'a',
						block_index: 0,
						current_text: 'aa..',
						suggested_text: 'aa.',
					},
					{
						title: 'B',
						feedback: 'b',
						action: 'b',
						block_index: 1,
						current_text: 'bb..',
						suggested_text: 'bb.',
					},
				],
			} )
		);

		// Accept item A on its own so it collapses into an Applied row with Undo.
		await act( async () => {
			fireEvent.click( findButtonByText( container, 'Accept' ) as HTMLButtonElement );
		} );
		await act( async () => {
			jest.advanceTimersByTime( 1000 );
		} );
		const undoBeforeRun = findButtonByText( container, 'Undo' );
		expect( undoBeforeRun ).toBeDefined();
		expect( undoBeforeRun?.hasAttribute( 'disabled' ) ).toBe( false );

		// Start a bulk run over the remaining item B. While it is in flight the Undo
		// on the already-applied item A must be locked so it cannot race the edit.
		await act( async () => {
			fireEvent.click( findAcceptAllButton( container ) as HTMLButtonElement );
		} );
		const undoDuringRun = findButtonByText( container, 'Undo' );
		expect( undoDuringRun ).toBeDefined();
		expect( undoDuringRun?.hasAttribute( 'disabled' ) ).toBe( true );

		await act( async () => {
			jest.advanceTimersByTime( 1000 );
		} );
		jest.useRealTimers();
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

	it( 'hides post suggestions without a sidebar config', () => {
		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );
		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).not.toContain( 'Editorial Review' );
	} );

	it( 'shows Editorial Review when enabled by agentsManagerData', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );
		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).toContain( 'Editorial Review' );
		expect( labels ).toContain( 'Simple Review' );
	} );

	it( 'hides Editorial Review on page editors', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'page' );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).not.toContain( 'Editorial Review' );
	} );

	it( 'hides Editorial Review until the post type is known', () => {
		installAiEditorialReviewData();
		installPostTypeMock();

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).not.toContain( 'Editorial Review' );
	} );

	it( 'hides Simple Review until the post has a saved post ID', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post', null );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Simple Review' );
		expect( labels ).toContain( 'Editorial Review' );
	} );

	it( 'hides Simple Review when the preview feature disables it', () => {
		installAiEditorialReviewData( { generateFeedback: false } );
		installPostTypeMock( 'post' );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Simple Review' );
		expect( labels ).toContain( 'Editorial Review' );
	} );

	it( 'hides Proofread by default and shows it when the preview feature enables it', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		expect( getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label ) ).not.toContain(
			'Proofread'
		);

		installAiEditorialReviewData( { proofreadContent: true } );
		installPostTypeMock( 'post' );
		expect( getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label ) ).toContain(
			'Proofread'
		);
	} );

	it( 'hides Proofread until the post has a saved post ID', () => {
		installAiEditorialReviewData( { proofreadContent: true } );
		installPostTypeMock( 'post', null );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Proofread' );
	} );

	it( 'hides Optimize Title when the feature disables it', () => {
		installAiEditorialReviewData( { aiEditorialReview: false, optimizeTitleSuggestion: false } );
		installPostTypeMock( 'post' );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).not.toContain( 'Editorial Review' );
	} );

	it( 'treats missing features as disabled', () => {
		( globalThis as any ).agentsManagerData = {
			jetpackAiSidebar: {
				enabled: true,
				features: { aiEditorialReview: true },
			},
		};
		installPostTypeMock( 'post' );

		const labels = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.label );

		expect( labels ).not.toContain( 'Optimize Title' );
		expect( labels ).toContain( 'Editorial Review' );
		expect( labels ).not.toContain( 'Simple Review' );
	} );

	it( 'attaches a one-line description to every starting-screen suggestion', () => {
		installAiEditorialReviewData( {
			optimizeTitleSuggestion: true,
			proofreadContent: true,
			seoSuggestions: true,
			excerptSuggestion: true,
		} );
		installPostTypeMock( 'post' );

		const suggestions = getEmptyViewSuggestions();
		const byLabel = ( label: string ) =>
			suggestions.find( ( suggestion ) => suggestion.label === label );

		[
			'Optimize Title',
			'Proofread',
			'Simple Review',
			'Editorial Review',
			'SEO Enhancer',
			'Generate Excerpt',
		].forEach( ( label ) => {
			const suggestion = byLabel( label );
			expect( suggestion ).toBeDefined();
			expect( typeof suggestion?.description ).toBe( 'string' );
			expect( suggestion?.description ).toBeTruthy();
			expect( suggestion?.description ).not.toContain( '\n' );
		} );
	} );

	it( 'shows Generate Excerpt when the excerptSuggestion feature is enabled', () => {
		installAiEditorialReviewData( { excerptSuggestion: true } );
		installPostTypeMock( 'post' );

		const excerptChip = getEmptyViewSuggestions().find(
			( suggestion ) => suggestion.id === 'generate-excerpt'
		);

		expect( excerptChip?.label ).toBe( 'Generate Excerpt' );
		expect( excerptChip?.prompt ).toBe( 'Generate an excerpt for this post' );
	} );

	it( 'hides Generate Excerpt when the feature is disabled', () => {
		installAiEditorialReviewData( { excerptSuggestion: false } );
		installPostTypeMock( 'post' );

		const ids = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.id );

		expect( ids ).not.toContain( 'generate-excerpt' );
	} );

	it( 'hides Generate Excerpt when the post type does not support excerpts', () => {
		installAiEditorialReviewData( { excerptSuggestion: true } );
		installPostTypeMock( 'page' );

		const ids = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.id );

		expect( ids ).not.toContain( 'generate-excerpt' );
	} );

	it( 'hides Generate Excerpt until the post type is known', () => {
		installAiEditorialReviewData( { excerptSuggestion: true } );
		installPostTypeMock();

		const ids = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.id );

		expect( ids ).not.toContain( 'generate-excerpt' );
	} );

	it( 'shows Generate Excerpt on pages when the page post type supports excerpts', () => {
		installAiEditorialReviewData( { excerptSuggestion: true } );
		// WordPress.com Simple / any site with the Jetpack SEO Tools module adds
		// excerpt support to pages — the legacy AI Excerpt panel shows there too.
		installPostTypeMock( 'page', 123, true );

		const ids = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.id );

		expect( ids ).toContain( 'generate-excerpt' );
	} );

	it( 'hides Generate Excerpt for templates and patterns even though they support excerpts', () => {
		installAiEditorialReviewData( { excerptSuggestion: true } );
		// Core registers excerpt support for wp_block (patterns), but the excerpt
		// field acts as a description there — the legacy panel excludes these types.
		installPostTypeMock( 'wp_block', 123, true );

		const ids = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.id );

		expect( ids ).not.toContain( 'generate-excerpt' );
	} );

	it( 'shows Generate Excerpt for posts while the post type record is still resolving', () => {
		installAiEditorialReviewData( { excerptSuggestion: true } );
		installPostTypeMock( 'post', 123, true, false );

		const ids = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.id );

		expect( ids ).toContain( 'generate-excerpt' );
	} );

	it( 'hides Generate Excerpt for pages while the post type record is still resolving', () => {
		installAiEditorialReviewData( { excerptSuggestion: true } );
		installPostTypeMock( 'page', 123, false, false );

		const ids = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.id );

		expect( ids ).not.toContain( 'generate-excerpt' );
	} );

	it( 'shows the SEO Enhancer dropdown when the seoSuggestions feature is enabled', () => {
		installAiEditorialReviewData( { seoSuggestions: true } );
		installPostTypeMock( 'post' );

		const seo = getEmptyViewSuggestions().find(
			( suggestion ) => suggestion.id === 'seo-enhancer'
		);

		expect( seo?.label ).toBe( 'SEO Enhancer' );
		expect( seo?.options?.map( ( option ) => option.label ) ).toEqual( [
			'Title',
			'Description',
			'Image Alt Text',
		] );
	} );

	it( 'submits the exact ability prompt as each dropdown option value', () => {
		installAiEditorialReviewData( { seoSuggestions: true } );
		installPostTypeMock( 'post' );

		const seo = getEmptyViewSuggestions().find(
			( suggestion ) => suggestion.id === 'seo-enhancer'
		);

		// An empty parent prompt makes the submitted text equal the option value
		// verbatim, so these must match the prompts the abilities route on.
		expect( seo?.prompt ).toBe( '' );
		expect( seo?.options ).toEqual( [
			{
				id: 'seo-title',
				label: 'Title',
				value: 'Generate an SEO title (meta title) for this post',
			},
			{
				id: 'seo-description',
				label: 'Description',
				value: 'Generate an SEO meta description for this post',
			},
			{
				id: 'image-alt-text',
				label: 'Image Alt Text',
				value: 'Generate descriptive alt text for the images in this post',
			},
		] );
	} );

	it( 'gates the SEO Enhancer dropdown independently of Optimize Title', () => {
		// Optimize Title on, SEO off: SEO must not appear.
		installAiEditorialReviewData( { optimizeTitleSuggestion: true, seoSuggestions: false } );
		installPostTypeMock( 'post' );

		const ids = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.id );

		expect( ids ).toContain( 'optimize-title' );
		expect( ids ).not.toContain( 'seo-enhancer' );
	} );

	it( 'hides the SEO Enhancer dropdown when the seoSuggestions feature is disabled', () => {
		installAiEditorialReviewData( { seoSuggestions: false } );
		installPostTypeMock( 'post' );

		const ids = getEmptyViewSuggestions().map( ( suggestion ) => suggestion.id );

		expect( ids ).not.toContain( 'seo-enhancer' );
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
		] );
		expect( getTracksCalls( 'jetpack_ai_editorial_review_suggestion_rendered' ) ).toEqual( [] );
		expect( getTracksCalls( 'jetpack_ai_block_transformation_suggestion_rendered' ) ).toEqual( [] );
	} );

	it( 'shows only block-specific suggestions when a block is selected', () => {
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
		] );
		expect( getTracksCalls( 'jetpack_ai_editorial_review_suggestion_rendered' ) ).toEqual( [] );
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

	it( 'limits block-specific suggestions to maxSuggestions', () => {
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
			'Change tone',
			'Check grammar',
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
					suggestion_id: 'change-tone',
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
			'Simple Review',
			'Editorial Review',
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

	it( 'hides review suggestions when a block is selected and block transformations are disabled', () => {
		installAiEditorialReviewData( { blockTransformations: false } );
		mockSelectedBlock = { clientId: 'b1', name: 'core/paragraph' };
		const onSuggestions = jest.fn();

		render( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		const latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions ).toEqual( [] );
	} );

	it( 'shows review suggestions at post level regardless of the block transformations feature', () => {
		( globalThis as any ).agentsManagerData = {
			jetpackAiSidebar: {
				enabled: true,
				features: { aiEditorialReview: true },
			},
		};
		mockSelectedBlock = null;
		const onSuggestions = jest.fn();

		render( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		const latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		expect( latestSuggestions.map( ( suggestion: any ) => suggestion.label ) ).toEqual( [
			'Editorial Review',
		] );
	} );

	it( 'keeps Simple Review on the backend path when clicked', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		const addMessage = jest.fn();
		const clearSuggestions = jest.fn();
		const feedbackPrompt = getEmptyViewSuggestions().find(
			( suggestion ) => suggestion.id === 'generate-feedback'
		)?.prompt;

		expect( feedbackPrompt ).toContain( 'saved title and saved block content' );
		expect( feedbackPrompt ).toContain( 'one-click suggestions when safe' );

		useAbilitiesSetup( {
			addMessage,
			clearSuggestions,
		} as any );
		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: feedbackPrompt },
				} )
			);
		} );

		expect( mockSetIsSplitScreen ).toHaveBeenCalledWith( true );
		expect( clearSuggestions ).toHaveBeenCalled();
		expect( addMessage ).not.toHaveBeenCalled();
	} );

	it( 'opens split-screen when the Proofread suggestion is clicked', () => {
		installAiEditorialReviewData( { proofreadContent: true } );
		installPostTypeMock( 'post' );
		const proofreadPrompt = getEmptyViewSuggestions().find(
			( suggestion ) => suggestion.id === 'proofread-content'
		)?.prompt;

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: proofreadPrompt },
				} )
			);
		} );

		expect( mockSetIsSplitScreen ).toHaveBeenCalledWith( true );
	} );

	it( 'opens split-screen when the Editorial Review suggestion is clicked', () => {
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

	it( 'exposes tone and language dropdown options on the block suggestions', () => {
		installAiEditorialReviewData();
		mockSelectedBlock = { clientId: 'b-options', name: 'core/paragraph' };
		const onSuggestions = jest.fn();

		render( React.createElement( SuggestionsProbe, { onSuggestions } ) );

		const latestSuggestions =
			onSuggestions.mock.calls[ onSuggestions.mock.calls.length - 1 ]?.[ 0 ] ?? [];
		const byId = ( id: string ) =>
			latestSuggestions.find( ( suggestion: any ) => suggestion.id === id );

		const changeTone = byId( 'change-tone' );
		expect( changeTone ).toBeDefined();
		// Empty prompt is the contract: each option's `value` is the full prompt.
		expect( changeTone.prompt ).toBe( '' );
		expect( changeTone.options.map( ( option: any ) => option.id ) ).toEqual( [
			'formal',
			'informal',
			'optimistic',
			'humorous',
			'serious',
			'skeptical',
			'empathetic',
			'confident',
			'passionate',
			'provocative',
		] );
		expect( changeTone.options[ 0 ] ).toEqual( {
			id: 'formal',
			label: '🎩 Formal',
			value: 'Change the tone of this text to be more formal',
		} );

		const translate = byId( 'translate' );
		expect( translate ).toBeDefined();
		expect( translate.prompt ).toBe( '' );
		expect( translate.options.map( ( option: any ) => option.id ) ).toEqual( [
			'en',
			'es',
			'fr',
			'de',
			'it',
			'pt',
			'ru',
			'zh',
			'ja',
			'ar',
			'hi',
			'ko',
		] );
		expect( translate.options[ 1 ] ).toEqual( {
			id: 'es',
			label: 'Spanish',
			value: 'Translate this block content to Spanish',
		} );
	} );

	it( 'tracks a change-tone dropdown selection with the chosen option_id', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		mockSelectedBlock = { clientId: 'b-tone', name: 'core/paragraph' };

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );
		mockedRecordTracksEvent.mockClear();

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: 'Change the tone of this text to be more formal' },
				} )
			);
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_block_transformation_suggestion_click',
			{
				suggestion_id: 'change-tone',
				suggestion_type: 'text',
				block_type: 'core/paragraph',
				surface: 'jetpack_ai_sidebar',
				option_id: 'formal',
			}
		);
	} );

	it( 'tracks a translate dropdown selection with the chosen option_id', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		mockSelectedBlock = { clientId: 'b-translate', name: 'core/paragraph' };

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );
		mockedRecordTracksEvent.mockClear();

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: 'Translate this block content to Spanish' },
				} )
			);
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_block_transformation_suggestion_click',
			{
				suggestion_id: 'translate',
				suggestion_type: 'text',
				block_type: 'core/paragraph',
				surface: 'jetpack_ai_sidebar',
				option_id: 'es',
			}
		);
	} );

	it( 'tracks a plain (no-dropdown) block transformation click without an option_id', () => {
		installAiEditorialReviewData();
		installPostTypeMock( 'post' );
		mockSelectedBlock = { clientId: 'b-grammar', name: 'core/paragraph' };

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );
		mockedRecordTracksEvent.mockClear();

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

	it( 'does not open split-screen when Editorial Review is unavailable', () => {
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
		delete ( globalThis as any ).agentsManagerData;
		delete ( window as any ).wp;
	} );

	it( 'includes the current post type in client context', () => {
		installPostTypeMock( 'post' );

		expect( contextProvider.getClientContext().currentScreen ).toMatchObject( {
			url: window.location.href,
			postType: 'post',
		} );
	} );

	it( 'suppresses full page content for the next Simple Review chip request', () => {
		installAiEditorialReviewData();
		installContextProviderMock();
		const feedbackPrompt = getEmptyViewSuggestions().find(
			( suggestion ) => suggestion.id === 'generate-feedback'
		)?.prompt;

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: feedbackPrompt },
				} )
			);
		} );

		const feedbackContext = contextProvider.getClientContext();
		expect( feedbackContext.currentPageContent ).toEqual( [] );
		expect( feedbackContext.jetpackAi ).toBeUndefined();
		expect( contextProvider.getClientContext().currentPageContent ).toHaveLength( 1 );
		expect( contextProvider.getClientContext().jetpackAi ).toBeUndefined();
	} );

	it( 'suppresses full page content for the next Proofread chip request', () => {
		installAiEditorialReviewData( { proofreadContent: true } );
		installContextProviderMock();
		const proofreadPrompt = getEmptyViewSuggestions().find(
			( suggestion ) => suggestion.id === 'proofread-content'
		)?.prompt;

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: proofreadPrompt },
				} )
			);
		} );

		const proofreadContext = contextProvider.getClientContext();
		expect( proofreadContext.currentPageContent ).toEqual( [] );
		expect( proofreadContext.jetpackAi ).toBeUndefined();
		expect( contextProvider.getClientContext().currentPageContent ).toHaveLength( 1 );
		expect( contextProvider.getClientContext().jetpackAi ).toBeUndefined();
	} );

	it( 'clears pending Simple Review content suppression when another suggestion is clicked', () => {
		installAiEditorialReviewData();
		installContextProviderMock();
		const suggestions = getEmptyViewSuggestions();
		const feedbackPrompt = suggestions.find(
			( suggestion ) => suggestion.id === 'generate-feedback'
		)?.prompt;
		const mediationPrompt = suggestions.find(
			( suggestion ) => suggestion.id === 'mediate-review-notes'
		)?.prompt;

		render( React.createElement( SuggestionsProbe, { onSuggestions: jest.fn() } ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: feedbackPrompt },
				} )
			);
			window.dispatchEvent(
				new CustomEvent( 'big-sky-inline-suggestion-click', {
					detail: { value: mediationPrompt },
				} )
			);
		} );

		const context = contextProvider.getClientContext();
		expect( context.currentPageContent ).toHaveLength( 1 );
		expect( context.jetpackAi ).toBeUndefined();
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
		it( 'includes update-block-content and show-component abilities', async () => {
			const abilities = await toolProvider.getAbilities();
			const names = abilities.map( ( a: any ) => a.name );

			expect( names ).toContain( 'wpcom/update-block-content' );
			expect( names ).toContain( SHOW_COMPONENT_TOOL_ID );
			expect( names ).toContain( LEGACY_SHOW_COMPONENT_TOOL_ID );
		} );

		it( 'wires a callback on each provided ability', async () => {
			const abilities = await toolProvider.getAbilities();
			const showComponent = abilities.find( ( a: any ) => a.name === SHOW_COMPONENT_TOOL_ID );
			const legacyShowComponent = abilities.find(
				( a: any ) => a.name === LEGACY_SHOW_COMPONENT_TOOL_ID
			);
			const updateBlock = abilities.find( ( a: any ) => a.name === 'wpcom/update-block-content' );

			expect( typeof showComponent?.callback ).toBe( 'function' );
			expect( typeof legacyShowComponent?.callback ).toBe( 'function' );
			expect( typeof updateBlock?.callback ).toBe( 'function' );
		} );

		it( 'delegates non-Jetpack legacy show-component callbacks to Big Sky', async () => {
			const args = {
				type: 'color-picker',
				props: { colors: [] },
			};
			const executeAbility = jest.fn().mockResolvedValue( {
				result: 'Big Sky component displayed successfully',
				returnToAgent: false,
			} );
			( window as any ).wp.abilities = {
				getAbilities: jest.fn().mockResolvedValue( [] ),
				executeAbility,
			};

			const abilities = await toolProvider.getAbilities();
			const legacyShowComponent = abilities.find(
				( a: any ) => a.name === LEGACY_SHOW_COMPONENT_TOOL_ID
			);
			const result = await legacyShowComponent.callback( args );

			expect( executeAbility ).toHaveBeenCalledWith( 'big-sky/show-component', args );
			expect( result ).toEqual( {
				result: 'Big Sky component displayed successfully',
				returnToAgent: false,
			} );
		} );

		it.each( [
			[ 'empty', '' ],
			[ 'whitespace-only', '   ' ],
		] )( 'does not delegate %s legacy show-component callbacks', async ( _label, type ) => {
			const executeAbility = jest.fn();
			( window as any ).wp.abilities = {
				getAbilities: jest.fn().mockResolvedValue( [] ),
				executeAbility,
			};

			const abilities = await toolProvider.getAbilities();
			const legacyShowComponent = abilities.find(
				( a: any ) => a.name === LEGACY_SHOW_COMPONENT_TOOL_ID
			);
			const result = await legacyShowComponent.callback( {
				type,
				props: {},
			} );

			expect( executeAbility ).not.toHaveBeenCalled();
			expect( result ).toMatchObject( { success: false } );
			expect( result.error ).toMatch( /missing type/ );
		} );

		it( 'omits update-block-content when block transformations are disabled', async () => {
			installAiEditorialReviewData( { blockTransformations: false } );

			const abilities = await toolProvider.getAbilities();
			const names = abilities.map( ( a: any ) => a.name );

			expect( names ).not.toContain( 'wpcom/update-block-content' );
			expect( names ).toContain( SHOW_COMPONENT_TOOL_ID );
			expect( names ).toContain( LEGACY_SHOW_COMPONENT_TOOL_ID );
		} );
	} );

	describe( 'executeAbility for show-component tools', () => {
		beforeEach( () => {
			installWpDataMock( 'Original Title' );
		} );

		it( 'returns an error when type is missing', async () => {
			const { result } = await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {} );
			expect( result ).toMatchObject( { success: false } );
			expect( ( result as any ).error ).toMatch( /missing type/ );
		} );

		it( 'returns an error for an unknown component type', async () => {
			const { result } = await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
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
				SHOW_COMPONENT_TOOL_ID,
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
			expect( parsed.tool_id ).toBe( SHOW_COMPONENT_TOOL_ID );
			expect( parsed.data.type ).toBe( 'title-picker' );
			expect( parsed.data.props ).toEqual( { titles } );
			expect( parsed.data.postId ).toBeUndefined();
			expect( parsed.data.calypsoCheckpointId ).toBe( 'call_test_123' );
			expect( parsed.data.isCurrent ).toBe( true );
			expect( parsed.data.hideZoomAction ).toBe( true );
		} );

		it( 'echoes the tool call id at the envelope top level', async () => {
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
				type: 'title-picker',
				props: { titles: [ { title: 'T', explanation: 'a' } ] },
				toolCallId: 'call_identity_1',
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.tool_call_id ).toBe( 'call_identity_1' );
		} );

		it( 'omits tool_call_id from the envelope when the input has no tool call id', async () => {
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
				type: 'title-picker',
				props: { titles: [ { title: 'T', explanation: 'a' } ] },
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed ).not.toHaveProperty( 'tool_call_id' );
		} );

		it( 'returns an agentMessage envelope with an Undo checkpoint for a seo-title-picker call', async () => {
			const titles = [ { title: 'SEO Title', explanation: 'a' } ];
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
				type: 'seo-title-picker',
				props: { titles },
				toolCallId: 'call_seo_title',
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.data.type ).toBe( 'seo-title-picker' );
			expect( parsed.data.props ).toEqual( { titles } );
			// SEO meta pickers snapshot for Undo, like title-picker.
			expect( parsed.data.calypsoCheckpointId ).toBe( 'call_seo_title' );
		} );

		it( 'returns an agentMessage envelope with an Undo checkpoint for a seo-description-picker call', async () => {
			const descriptions = [ { description: 'An SEO description', explanation: 'a' } ];
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
				type: 'seo-description-picker',
				props: { descriptions },
				toolCallId: 'call_seo_desc',
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.data.type ).toBe( 'seo-description-picker' );
			expect( parsed.data.props ).toEqual( { descriptions } );
			expect( parsed.data.calypsoCheckpointId ).toBe( 'call_seo_desc' );
		} );

		it( 'returns an agentMessage envelope with an Undo checkpoint for an excerpt-picker call', async () => {
			const excerpts = [ { excerpt: 'A short summary.', explanation: 'a' } ];
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
				type: 'excerpt-picker',
				props: { excerpts },
				toolCallId: 'call_excerpt',
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.data.type ).toBe( 'excerpt-picker' );
			expect( parsed.data.props ).toEqual( { excerpts } );
			expect( parsed.data.calypsoCheckpointId ).toBe( 'call_excerpt' );
		} );

		it( 'returns an agentMessage envelope with an Undo checkpoint for an image-alt-text-picker call', async () => {
			const images = [ { clientId: 'img1', url: 'u', currentAlt: '', alt: 'A photo' } ];
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
				type: 'image-alt-text-picker',
				props: { images },
				toolCallId: 'call_alt',
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.data.type ).toBe( 'image-alt-text-picker' );
			expect( parsed.data.props ).toEqual( { images } );
			expect( parsed.data.calypsoCheckpointId ).toBe( 'call_alt' );
		} );

		it( 'accepts the legacy Big Sky show-component tool during migration', async () => {
			const { result } = ( await toolProvider.executeAbility( LEGACY_SHOW_COMPONENT_TOOL_ID, {
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
			expect( parsed.tool_id ).toBe( SHOW_COMPONENT_TOOL_ID );
			expect( parsed.data.type ).toBe( 'review-mediation' );
		} );

		it( 'delegates non-Jetpack legacy show-component calls to Big Sky', async () => {
			const args = {
				type: 'color-picker',
				props: { colors: [] },
			};
			const executeAbility = jest.fn().mockResolvedValue( {
				result: 'Big Sky component displayed successfully',
				returnToAgent: false,
			} );
			( window as any ).wp.abilities = { executeAbility };

			const result = await toolProvider.executeAbility( LEGACY_SHOW_COMPONENT_TOOL_ID, args );

			expect( executeAbility ).toHaveBeenCalledWith( 'big-sky/show-component', args );
			expect( result ).toEqual( {
				result: 'Big Sky component displayed successfully',
				returnToAgent: false,
			} );
		} );

		it.each( [
			[ 'empty', '' ],
			[ 'whitespace-only', '   ' ],
		] )( 'does not delegate %s legacy show-component calls to Big Sky', async ( _label, type ) => {
			const executeAbility = jest.fn();
			( window as any ).wp.abilities = { executeAbility };

			const { result } = await toolProvider.executeAbility( LEGACY_SHOW_COMPONENT_TOOL_ID, {
				type,
				props: {},
			} );

			expect( executeAbility ).not.toHaveBeenCalled();
			expect( result ).toMatchObject( { success: false } );
			expect( result.error ).toMatch( /missing type/ );
		} );

		it( 'does not attach a title checkpoint to review-mediation components', async () => {
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
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

		it( 'stamps post-feedback components with the current post ID', async () => {
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
				type: 'post-feedback',
				props: {
					summary: 'Summary.',
					items: [],
				},
				toolCallId: 'call_post_feedback_123',
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.data.type ).toBe( 'post-feedback' );
			expect( parsed.data.calypsoCheckpointId ).toBeUndefined();
			expect( parsed.data.isCurrent ).toBe( true );
			expect( parsed.data.hideZoomAction ).toBe( true );
			expect( parsed.data.postId ).toBe( 123 );
			expect( parsed.data.props.postId ).toBe( 123 );
		} );

		it( 'preserves the reviewed post ID on post-feedback components', async () => {
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
				type: 'post-feedback',
				props: {
					summary: 'Summary.',
					items: [],
					postId: 77,
				},
				toolCallId: 'call_post_feedback_456',
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.data.type ).toBe( 'post-feedback' );
			expect( parsed.data.postId ).toBe( 77 );
			expect( parsed.data.props.postId ).toBe( 77 );
		} );

		it( 'does not stamp review-mediation components without a saved editor post ID', async () => {
			installWpDataMock( 'Original Title', 0 );

			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
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
			const { result } = ( await toolProvider.executeAbility( SHOW_COMPONENT_TOOL_ID, {
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

	it( 'restores only the excerpt for an excerpt checkpoint, leaving later title edits intact', async () => {
		installWpDataMock( 'Original Title', 123, 'Original excerpt' );
		const api = useCheckpoint();

		api.setCheckpoint( 'cp-excerpt', [ 'excerpt' ] );

		( window as any ).wp.data
			.dispatch( 'core/editor' )
			.editPost( { title: 'Edited Title', excerpt: 'AI generated excerpt' } );
		await api.restoreCheckpoint( 'cp-excerpt' );

		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'excerpt' )
		).toBe( 'Original excerpt' );
		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' )
		).toBe( 'Edited Title' );
	} );

	it( 'restores only the title for a default checkpoint, leaving later excerpt edits intact', async () => {
		installWpDataMock( 'Original Title', 123, 'Original excerpt' );
		const api = useCheckpoint();

		api.setCheckpoint( 'cp-title' );

		( window as any ).wp.data
			.dispatch( 'core/editor' )
			.editPost( { title: 'AI Title', excerpt: 'User excerpt' } );
		await api.restoreCheckpoint( 'cp-title' );

		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' )
		).toBe( 'Original Title' );
		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'excerpt' )
		).toBe( 'User excerpt' );
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
		{ name: string; attributes: Record< string, any >; innerBlocks?: any[] }
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
		delete ( window as any ).wp;
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

	it( 'updates list item content with one-click edits', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/list-item',
				attributes: { content: 'Register online by 1 May.' },
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );

		const promise = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'online by 1 June',
			undefined,
			'online by 1 May'
		);
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: true,
			contentBefore: 'Register online by 1 May.',
			contentAfter: 'Register online by 1 June.',
		} );
		expect( blockUpdates ).toEqual( [
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { content: 'Register online by 1 June.' },
			},
		] );
	} );

	it( 'updates image captions with the caption attribute', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/image',
				attributes: { caption: 'Outdoor map activity' },
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );

		const promise = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'Children exploring an outdoor map',
			undefined,
			'Outdoor map activity'
		);
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: true,
			contentBefore: 'Outdoor map activity',
			contentAfter: 'Children exploring an outdoor map',
		} );
		expect( blockUpdates ).toEqual( [
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { caption: 'Children exploring an outdoor map' },
			},
		] );
	} );

	it( 'updates explicitly targeted string attributes', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/quote',
				attributes: {
					value: '<p>Useful quoted text.</p>',
					citation: 'Old citation',
				},
			},
		} );
		useAbilitiesSetup( { addMessage: () => undefined, clearSuggestions: () => undefined } as any );

		const promise = applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'Updated citation',
			undefined,
			'Old citation',
			undefined,
			'citation'
		);
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: true,
			editableAttribute: 'citation',
			contentBefore: 'Old citation',
			contentAfter: 'Updated citation',
		} );
		expect( blockUpdates ).toEqual( [
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { citation: 'Updated citation' },
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

	it( 'fails safely when the block has no editable string-like attribute', async () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/query',
				attributes: { queryId: 1 },
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

	it( 'returns a failed result when block editor dispatch throws', async () => {
		const select = jest.fn();
		( window as any ).wp = {
			data: {
				select,
				dispatch: ( store: string ) => {
					if ( store === 'core/block-editor' ) {
						throw new Error( 'store missing' );
					}
					return undefined;
				},
			},
		};

		const result = await applyReviewEdit( '550e8400-e29b-41d4-a716-446655440000', 'new text' );

		expect( result ).toMatchObject( {
			success: false,
			error: 'Block editor not available',
			returnToAgent: false,
		} );
		expect( select ).not.toHaveBeenCalled();
	} );

	it( 'returns a failed result when block editor select throws during snapshot lookup', async () => {
		const updateBlockAttributes = jest.fn();
		( window as any ).wp = {
			data: {
				select: ( store: string ) => {
					if ( store === 'core/block-editor' ) {
						throw new Error( 'store missing' );
					}
					return undefined;
				},
				dispatch: ( store: string ) =>
					store === 'core/block-editor' ? { updateBlockAttributes } : undefined,
			},
		};

		const result = await applyReviewEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'new text',
			undefined,
			'original text'
		);

		expect( result ).toMatchObject( {
			success: false,
			error: 'block not found',
			returnToAgent: false,
		} );
		expect( updateBlockAttributes ).not.toHaveBeenCalled();
	} );

	it( 'returns a failed result when block editor mutation throws', async () => {
		const updateBlockAttributes = jest.fn( () => {
			throw new Error( 'mutation failed' );
		} );
		( window as any ).wp = {
			data: {
				select: ( store: string ) => {
					if ( store === 'core/block-editor' ) {
						return {
							getBlock: ( clientId: string ) => ( {
								clientId,
								name: 'core/paragraph',
								attributes: { content: 'original block content' },
							} ),
						};
					}
					return undefined;
				},
				dispatch: ( store: string ) =>
					store === 'core/block-editor' ? { updateBlockAttributes } : undefined,
			},
		};

		const promise = applyReviewEdit( '550e8400-e29b-41d4-a716-446655440000', 'new text' );
		jest.advanceTimersByTime( 1000 );
		const result = await promise;

		expect( result ).toMatchObject( {
			success: false,
			error: 'Block editor not available',
			returnToAgent: false,
		} );
		expect( updateBlockAttributes ).toHaveBeenCalledTimes( 1 );
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

	it( 'undoBlockEdit restores image captions through the caption attribute', () => {
		const { blockUpdates } = installWpDataMockWithBlockEditor( {
			'550e8400-e29b-41d4-a716-446655440000': {
				name: 'core/image',
				attributes: { caption: 'Children exploring an outdoor map' },
			},
		} );

		const restored = undoBlockEdit(
			'550e8400-e29b-41d4-a716-446655440000',
			'Outdoor map activity',
			'Children exploring an outdoor map'
		);

		expect( restored ).toBe( true );
		expect( blockUpdates ).toEqual( [
			{
				clientId: '550e8400-e29b-41d4-a716-446655440000',
				attrs: { caption: 'Outdoor map activity' },
			},
		] );
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
		const el = appendRootBlockListLayout();
		expect( findBlockListLayout() ).toBe( el );
	} );

	it( 'prefers the root block-list layout containing a reference block', () => {
		appendRootBlockListLayout();
		const { layout: root, block } = appendBlockInRootLayout( 'block-1' );

		expect( findBlockListLayout( block ) ).toBe( root );
	} );

	it( 'finds the root block-list layout in the reference block owner document', () => {
		appendRootBlockListLayout();

		const iframe = document.createElement( 'iframe' );
		document.body.appendChild( iframe );
		const frameDocument = iframe.contentDocument as Document;
		const root = appendRootBlockListLayout( frameDocument );
		const block = frameDocument.createElement( 'div' );
		block.setAttribute( 'data-block', 'block-1' );
		frameDocument.body.appendChild( block );

		expect( findBlockListLayout( block ) ).toBe( root );
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
