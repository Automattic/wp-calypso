/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { TaskUpdate } from '@automattic/agenttic-client';
import type { Suggestion } from '@automattic/agenttic-ui';
import type { ComponentProps } from 'react';

const mockUseAgentChat = jest.fn();
const mockUpdateSessionId = jest.fn();
let mockManagerHasAgent = true;
let mockAgentChatConfig: { onTaskUpdate?: ( update: TaskUpdate ) => Promise< void > } | undefined;
let mockConversationConfig:
	| {
			onSuccess?: (
				messages: Array< {
					messageId: string;
					role: 'user' | 'agent';
					parts: Array< { type: 'text'; text: string } >;
					kind: 'message';
				} >,
				sessionId: string
			) => void;
	  }
	| undefined;
const mockUseRegenerateAction = jest.fn();
const mockUseCheckpointAction = jest.fn();
const mockUseConversation = jest.fn();
const mockUseImageUpload = jest.fn();
const mockIsReaderChatAgent = jest.fn();
const mockInvalidateCheckpointAction = jest.fn();
const mockInvalidatedCheckpointIds = new Set< string >();
const mockRevertedCheckpointIds = new Set< string >();
const mockSetCheckpointActionReverted = jest.fn(
	( checkpointId: string, isReverted: boolean ): boolean => {
		const wasReverted = mockRevertedCheckpointIds.has( checkpointId );
		if ( isReverted ) {
			mockRevertedCheckpointIds.add( checkpointId );
		} else {
			mockRevertedCheckpointIds.delete( checkpointId );
		}
		return wasReverted !== isReverted;
	}
);
let mockSelectedBlockType: string | undefined;
let mockBlockEditorStoreThrows = false;
let mockHasEditorRedo = false;
let mockEditorBlocks: unknown[] = [];
const mockDataStoreSubscribers = new Set< () => void >();

const mockSelectDataStore = ( storeName: string ) => {
	if ( storeName === 'core/editor' ) {
		return { hasEditorRedo: () => mockHasEditorRedo };
	}
	if ( storeName === 'core/block-editor' ) {
		if ( mockBlockEditorStoreThrows ) {
			throw new Error( 'Block editor store unavailable' );
		}
		return {
			getSelectedBlock: () => ( mockSelectedBlockType ? { name: mockSelectedBlockType } : null ),
			getBlocks: () => mockEditorBlocks,
		};
	}
	return {};
};

function mockGetCheckpointIdForMessage( message: {
	content?: Array< { text?: string } >;
} ): string | null {
	try {
		const parsed = JSON.parse( message.content?.[ 0 ]?.text ?? '' );
		if (
			parsed.tool_id !== 'big_sky__apply_block_edits' &&
			parsed.tool_id !== 'wpcom__update_block_content'
		) {
			return null;
		}
		return parsed.data?.calypsoCheckpointId ?? parsed.tool_call_id ?? null;
	} catch {
		return null;
	}
}

const mockCheckpointActions = () => {
	let isCheckpointActionAvailable: ( ( checkpointId: string ) => boolean ) | undefined;
	const getActions = ( message: { content?: Array< { text?: string } > } ) => {
		const checkpointId = mockGetCheckpointIdForMessage( message );
		if ( ! checkpointId ) {
			return [];
		}

		const canAct =
			! mockInvalidatedCheckpointIds.has( checkpointId ) &&
			( isCheckpointActionAvailable?.( checkpointId ) ?? true );
		const isReverted = mockRevertedCheckpointIds.has( checkpointId );
		let label = canAct ? 'Updated and Undo' : 'Updated';
		if ( isReverted ) {
			label = canAct ? 'Reverted and Redo' : 'Reverted';
		}
		return [
			{
				type: 'component',
				id: 'checkpoint',
				label,
				component: () => null,
				componentProps: {
					initiallyReverted: isReverted,
					...( canAct && { onUndo: jest.fn(), onRedo: jest.fn() } ),
				},
				order: 1,
			},
		];
	};
	mockUseCheckpointAction.mockImplementation(
		(
			_registerMessageActions: unknown,
			_checkpoint: unknown,
			nextIsCheckpointActionAvailable?: ( checkpointId: string ) => boolean
		) => {
			isCheckpointActionAvailable = nextIsCheckpointActionAvailable;
			return getActions;
		}
	);
};

const mockAgentChat = jest.fn(
	( {
		onSuggestionClick,
		onSubmit,
		onAbort,
		error,
		inputValue,
		onInputChange,
		emptyViewSuggestions = [],
	}: {
		messages?: unknown[];
		onSuggestionClick: (
			suggestion: Suggestion | string,
			availableSuggestions?: Suggestion[]
		) => void;
		onSubmit: ( message: string ) => void;
		onAbort?: () => void;
		error?: string | null;
		inputValue?: string;
		onInputChange?: ( value: string ) => void;
		emptyViewSuggestions?: Suggestion[];
	} ) => (
		<>
			<button
				onClick={ () => {
					const suggestion = {
						id: 'simplify-text',
						label: 'Simplify text',
						prompt: 'Simplify this text to make it easier to read',
					};
					onSuggestionClick( suggestion, [ suggestion ] );
				} }
			>
				Click suggestion
			</button>
			<button
				onClick={ () => {
					const suggestion = {
						id: 'check-grammar',
						label: 'Check grammar',
						prompt: 'Check the grammar and spelling of this text',
					};
					onSuggestionClick( suggestion, [ suggestion ] );
				} }
			>
				Click block suggestion
			</button>
			<button
				onClick={ () => {
					const option = {
						id: 'formal',
						label: 'Formal',
						value: 'Change the tone of this text to be more formal',
					};
					const selectedSuggestion = {
						id: 'change-tone',
						label: 'Change tone Formal',
						prompt: option.value,
					};
					const availableSuggestion = {
						id: 'change-tone',
						label: 'Change tone',
						prompt: '',
						options: [ option ],
					};
					onSuggestionClick( selectedSuggestion, [ availableSuggestion ] );
				} }
			>
				Click block dropdown suggestion
			</button>
			<button
				onClick={ () => {
					const option = {
						id: 'seo-title',
						label: 'Title',
						value: 'Generate an SEO title for this post',
					};
					const selectedSuggestion = {
						id: 'seo-enhancer',
						label: 'SEO Enhancer Title',
						prompt: option.value,
					};
					const availableSuggestion = {
						id: 'seo-enhancer',
						label: 'SEO Enhancer',
						prompt: '',
						options: [ option ],
					};
					onSuggestionClick( selectedSuggestion, [ availableSuggestion ] );
				} }
			>
				Click post dropdown suggestion
			</button>
			<button onClick={ () => onSuggestionClick( 'Check the grammar and spelling of this text' ) }>
				Click string suggestion
			</button>
			<button
				onClick={ () =>
					onSuggestionClick( {
						id: 'weekly-brief',
						label: 'Walk me through the attached weekly brief',
						prompt: 'Walk me through the attached weekly brief',
						autoSubmit: true,
					} )
				}
			>
				Click auto-submit suggestion
			</button>
			<button onClick={ () => onInputChange?.( 'Describe these images' ) }>Type message</button>
			<button onClick={ () => onSubmit( 'Describe these images' ) }>Submit message</button>
			<button onClick={ () => onAbort?.() }>Stop</button>
			{ error && <div data-testid="chat-error">{ error }</div> }
			<div data-testid="input-value">{ inputValue }</div>
			<ul data-testid="empty-view-suggestions">
				{ emptyViewSuggestions.map( ( suggestion ) => (
					<li key={ suggestion.id }>
						<button
							type="button"
							onClick={ () => onSuggestionClick( suggestion, emptyViewSuggestions ) }
						>
							{ suggestion.label }
						</button>
					</li>
				) ) }
			</ul>
		</>
	)
);

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		getAgentManager: () => ( {
			updateSessionId: mockUpdateSessionId,
			hasAgent: () => mockManagerHasAgent,
		} ),
		useAgentChat: ( config: typeof mockAgentChatConfig ) => {
			mockAgentChatConfig = config;
			return mockUseAgentChat();
		},
	} ),
	{ virtual: true }
);
jest.mock( '@wordpress/data', () => {
	const { useEffect, useReducer, useRef } = jest.requireActual< typeof import('react') >( 'react' );

	return {
		select: ( storeName: string ) => mockSelectDataStore( storeName ),
		useSelect: ( mapSelect: ( select: ( storeName: string ) => object ) => unknown ) => {
			const selectorRef = useRef( mapSelect );
			selectorRef.current = mapSelect;
			const selectedValue = mapSelect( mockSelectDataStore );
			const selectedValueRef = useRef( selectedValue );
			selectedValueRef.current = selectedValue;
			const [ , forceRender ] = useReducer( ( count: number ) => count + 1, 0 );

			useEffect( () => {
				const updateSelectedValue = () => {
					const nextValue = selectorRef.current( mockSelectDataStore );
					if ( ! Object.is( selectedValueRef.current, nextValue ) ) {
						selectedValueRef.current = nextValue;
						forceRender();
					}
				};
				mockDataStoreSubscribers.add( updateSelectedValue );
				return () => {
					mockDataStoreSubscribers.delete( updateSelectedValue );
				};
			}, [] );

			return selectedValue;
		},
	};
} );
jest.mock( '@wordpress/element', () => jest.requireActual( 'react' ) );
jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );
jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => jest.fn(),
} ) );
jest.mock( '../../contexts', () => {
	const { saveSessionId } = jest.requireActual( '../../utils/agent-session' );
	return {
		useAgentsManagerContext: () => ( {
			agentConfig: {
				agentId: 'wp-orchestrator',
				onSessionIdChange: ( sessionId: string ) => saveSessionId( sessionId, 'wp-orchestrator' ),
			},
			getTabSessionId: () => 'session-id',
		} ),
	};
} );
jest.mock( '../../hooks/custom-actions', () => ( {
	useRegisterCustomActions: () => {},
} ) );
jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: jest.fn(),
	recordAgentsManagerTracksEvent: jest.fn(),
} ) );
jest.mock( '../../hooks/use-abilities-registration', () => () => {} );
jest.mock( '../../hooks/use-conversation', () => ( config: typeof mockConversationConfig ) => {
	mockConversationConfig = config;
	return mockUseConversation( config );
} );
jest.mock( '../../hooks/use-checkpoint-action', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockUseCheckpointAction( ...args ),
	getCheckpointIdForMessage: mockGetCheckpointIdForMessage,
	isCheckpointActionInvalidated: ( checkpointId: string ) =>
		mockInvalidatedCheckpointIds.has( checkpointId ),
	invalidateCheckpointAction: ( checkpointId: string ) => {
		mockInvalidatedCheckpointIds.add( checkpointId );
		mockInvalidateCheckpointAction( checkpointId );
	},
	setCheckpointActionReverted: ( checkpointId: string, isReverted: boolean ) =>
		mockSetCheckpointActionReverted( checkpointId, isReverted ),
} ) );
jest.mock( '../../hooks/use-feedback-action', () => () => ( {
	showFeedbackInput: false,
	submitFeedbackText: jest.fn(),
	resetFeedback: jest.fn(),
	getFeedbackActionsForMessage: () => [],
} ) );
jest.mock( '../../hooks/use-regenerate-action', () => ( {
	__esModule: true,
	default: ( config: unknown ) => mockUseRegenerateAction( config ),
} ) );
jest.mock( '../../hooks/use-copy-action', () => () => () => [] );
jest.mock( '../../hooks/use-image-upload', () => ( {
	useImageUpload: () => mockUseImageUpload(),
} ) );
jest.mock( '../../hooks/use-sources-action', () => () => {} );
jest.mock( '../../utils/convert-tool-messages-to-components', () => ( {
	__esModule: true,
	default: ( { messages }: { messages: unknown[] } ) => messages,
	isContextOnlyMessage: ( message: {
		context?: { flags?: { context_only?: boolean } };
		content?: Array< { type?: string; data?: { flags?: { context_only?: boolean } } } >;
	} ) =>
		message.context?.flags?.context_only === true ||
		message.content?.some(
			( content ) =>
				content.type === 'context' ||
				( content.type === 'data' && content.data?.flags?.context_only === true )
		),
} ) );
jest.mock( '../../utils/external-context', () => ( {
	consumeNextMessageExternalContextEntries: jest.fn(),
	removeExternalContextCard: jest.fn(),
	removeExternalContextEntry: jest.fn(),
} ) );
jest.mock( '../../utils/is-reader-chat-agent', () => ( {
	isReaderChatAgent: () => mockIsReaderChatAgent(),
} ) );
jest.mock( '../agent-chat', () => ( {
	__esModule: true,
	default: ( props: unknown ) => mockAgentChat( props as Parameters< typeof mockAgentChat >[ 0 ] ),
} ) );

import { getSessionId } from '../../utils/agent-session';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import OrchestratorChat from '../orchestrator-chat';

const chat = ( props: Partial< ComponentProps< typeof OrchestratorChat > > = {} ) => (
	<OrchestratorChat
		emptyViewSuggestions={ [] }
		isDocked={ false }
		isOpen
		suggestionsVisible
		onClose={ jest.fn() }
		onExpand={ jest.fn() }
		chatHeaderOptions={ [] }
		markdownComponents={ {} }
		markdownExtensions={ {} }
		isCompactMode={ false }
		onHasMessagesChange={ jest.fn() }
		{ ...props }
	/>
);

const agentChatReturn = ( overrides: Record< string, unknown > = {} ) => ( {
	addMessage: jest.fn(),
	messages: [],
	suggestions: [],
	isProcessing: false,
	error: null,
	loadMessages: jest.fn(),
	onSubmit: jest.fn(),
	abortCurrentRequest: jest.fn(),
	clearSuggestions: jest.fn(),
	registerSuggestions: jest.fn(),
	registerMessageActions: jest.fn(),
	unregisterMessageActions: jest.fn(),
	// Mirror production: agenttic hands back a real regenerate handler.
	getRegenerateHandler: jest.fn( () => jest.fn() ),
	progressMessage: null,
	...overrides,
} );

const createImageUpload = ( overrides: Record< string, unknown > = {} ) => ( {
	pendingImages: [],
	uploadingImages: [],
	isUploadingImages: false,
	handleFilesSelected: jest.fn(),
	handleRemoveImage: jest.fn(),
	uploadImagesToWordPress: jest.fn(),
	abortUpload: jest.fn( () => false ),
	...overrides,
} );

const renderWithImageUpload = ( imageUpload: ReturnType< typeof createImageUpload > ) => {
	mockUseImageUpload.mockReturnValue( imageUpload );
	return render( chat() );
};

// Show-component fixtures shared by the retention tests.
const SHOW_COMPONENT_CONTENT = JSON.stringify( {
	tool_id: 'big_sky__show_component',
	tool_call_id: 'title-picker-call',
	data: { type: 'titlePicker', summary: 'Optimize title' },
} );

const userMessage = {
	id: 'user-1',
	role: 'user',
	content: [ { type: 'text', text: 'Optimize the title' } ],
	timestamp: 0,
	archived: false,
	showIcon: true,
};

const showComponentMessage = ( id: string, content: string = SHOW_COMPONENT_CONTENT ) => ( {
	id,
	role: 'agent',
	content: [ { type: 'text', text: content } ],
	timestamp: 1,
	archived: false,
	showIcon: true,
} );

const createCheckpointMessage = (
	id: string,
	checkpointId: string,
	changeType?: 'text-content'
) => ( {
	id,
	role: 'agent',
	content: [
		{
			type: 'text',
			text: JSON.stringify( {
				tool_id: 'big_sky__apply_block_edits',
				tool_call_id: checkpointId,
				data: {
					result: {
						success: true,
						outcome: 'updated',
						...( changeType && { changeType } ),
					},
				},
			} ),
		},
	],
	timestamp: 1,
} );

const createSwappableCheckpoint = () => ( {
	getLastEditorState: jest.fn(),
	setCheckpoint: jest.fn(),
	addCheckpointKeys: jest.fn(),
	restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
	canSwapCheckpoint: jest.fn().mockReturnValue( true ),
	swapCheckpoint: jest.fn().mockResolvedValue( undefined ),
	addNewPageToCheckpoint: jest.fn(),
	addPageRenameToCheckpoint: jest.fn(),
	addPageRemovalToCheckpoint: jest.fn(),
	getLatestUserMessageId: jest.fn(),
	clearCheckpoint: jest.fn(),
	hasCheckpoint: jest.fn().mockReturnValue( true ),
} );

const getDisplayedCheckpointAction = ( messageId: string ) => {
	const messages = mockAgentChat.mock.calls.at( -1 )![ 0 ].messages as Array< {
		id: string;
		actions?: Array< {
			id: string;
			label?: string;
			componentProps?: Record< string, unknown >;
		} >;
	} >;
	return messages
		.find( ( message ) => message.id === messageId )
		?.actions?.find( ( action ) => action.id === 'checkpoint' );
};

const countShowComponentMessages = () => {
	const messages = mockAgentChat.mock.calls.at( -1 )![ 0 ].messages as Array< {
		content?: Array< { text?: string } >;
	} >;
	return messages.filter( ( message ) => {
		const text = message?.content?.[ 0 ]?.text;
		if ( typeof text !== 'string' ) {
			return false;
		}
		try {
			return JSON.parse( text )?.tool_id === 'big_sky__show_component';
		} catch ( _error ) {
			return false;
		}
	} ).length;
};

describe( 'OrchestratorChat', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseCheckpointAction.mockReturnValue( () => [] );
		// Default getter: contributes no actions.
		mockUseRegenerateAction.mockReturnValue( () => [] );
		mockUseConversation.mockReturnValue( { isLoading: false } );
		mockUseAgentChat.mockReturnValue( agentChatReturn() );
		mockUseImageUpload.mockReturnValue( createImageUpload() );
		mockIsReaderChatAgent.mockReturnValue( false );
		mockSelectedBlockType = undefined;
		mockBlockEditorStoreThrows = false;
		sessionStorage.clear();
		mockManagerHasAgent = true;
		mockHasEditorRedo = false;
		mockEditorBlocks = [];
		mockDataStoreSubscribers.clear();
		mockInvalidatedCheckpointIds.clear();
		mockRevertedCheckpointIds.clear();
		mockAgentChatConfig = undefined;
		mockConversationConfig = undefined;
	} );

	it( 'ignores a conversation result for a discarded agent', () => {
		mockManagerHasAgent = false;
		render( chat() );

		const { onSuccess } = mockUseConversation.mock.calls.at( -1 )![ 0 ] as {
			onSuccess: ( messages: unknown[], sessionId: string ) => void;
		};
		act( () => {
			onSuccess( [], 'canonical-session-id' );
		} );

		expect( mockUpdateSessionId ).not.toHaveBeenCalled();
		expect( getSessionId( 'wp-orchestrator' ) ).toBe( '' );
	} );

	it( 'saves the server’s canonical session ID as the tab session', () => {
		render( chat() );

		const { onSuccess } = mockUseConversation.mock.calls.at( -1 )![ 0 ] as {
			onSuccess: ( messages: unknown[], sessionId: string ) => void;
		};
		act( () => {
			onSuccess( [], 'canonical-session-id' );
		} );

		expect( getSessionId( 'wp-orchestrator' ) ).toBe( 'canonical-session-id' );
	} );

	it( 'dispatches the inline suggestion event when an Agenttic suggestion is clicked', () => {
		const listener = jest.fn();
		window.addEventListener( 'big-sky-inline-suggestion-click', listener );

		render( chat() );

		fireEvent.click( screen.getByText( 'Click suggestion' ) );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( ( listener.mock.calls[ 0 ][ 0 ] as CustomEvent ).detail ).toEqual( {
			value: 'Simplify this text to make it easier to read',
			autoSubmit: false,
			suggestionId: 'simplify-text',
		} );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_suggestion_click', {
			suggestion_text: 'Simplify this text to make it easier to read',
			suggestion_id: 'simplify-text',
			available_suggestions: '|simplify-text|',
		} );

		window.removeEventListener( 'big-sky-inline-suggestion-click', listener );
	} );

	it( 'dispatches and tracks the AI Editorial Review suggestion ID once', () => {
		const listener = jest.fn();
		window.addEventListener( 'big-sky-inline-suggestion-click', listener );
		const suggestion = {
			id: 'ai-editorial-review',
			label: 'Editorial Review',
			prompt: 'Run an AI Editorial Review',
		};

		render( chat( { emptyViewSuggestions: [ suggestion ] } ) );
		jest.mocked( recordBigSkyTracksEvent ).mockClear();

		fireEvent.click( screen.getByRole( 'button', { name: 'Editorial Review' } ) );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( ( listener.mock.calls[ 0 ][ 0 ] as CustomEvent ).detail ).toEqual( {
			value: 'Run an AI Editorial Review',
			autoSubmit: false,
			suggestionId: 'ai-editorial-review',
		} );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_suggestion_click', {
			suggestion_text: 'Run an AI Editorial Review',
			suggestion_id: 'ai-editorial-review',
			available_suggestions: '|ai-editorial-review|',
		} );

		window.removeEventListener( 'big-sky-inline-suggestion-click', listener );
	} );

	it( 'dispatches the inline suggestion event when Agenttic passes a prompt string', () => {
		const listener = jest.fn();
		window.addEventListener( 'big-sky-inline-suggestion-click', listener );

		render( chat() );

		fireEvent.click( screen.getByText( 'Click string suggestion' ) );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( ( listener.mock.calls[ 0 ][ 0 ] as CustomEvent ).detail ).toEqual( {
			value: 'Check the grammar and spelling of this text',
			autoSubmit: false,
		} );

		window.removeEventListener( 'big-sky-inline-suggestion-click', listener );
	} );

	it( 'flags auto-submit suggestions so the input is not repopulated', () => {
		const listener = jest.fn();
		window.addEventListener( 'big-sky-inline-suggestion-click', listener );

		render( chat() );

		fireEvent.click( screen.getByText( 'Click auto-submit suggestion' ) );

		// The event still fires so click listeners (e.g. the Jetpack sidebar hiding the
		// clicked chip) keep working, but it carries `autoSubmit` so the input listener
		// skips repopulating the composer the AgentUI already submitted and cleared.
		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( ( listener.mock.calls[ 0 ][ 0 ] as CustomEvent ).detail ).toEqual( {
			value: 'Walk me through the attached weekly brief',
			autoSubmit: true,
			suggestionId: 'weekly-brief',
		} );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'chat_suggestion_click',
			expect.objectContaining( { suggestion_id: 'weekly-brief' } )
		);

		window.removeEventListener( 'big-sky-inline-suggestion-click', listener );
	} );

	it( 'records block context on a regular block suggestion', () => {
		mockSelectedBlockType = 'core/paragraph';
		const listener = jest.fn();
		window.addEventListener( 'big-sky-inline-suggestion-click', listener );

		render(
			chat( {
				useSuggestions: () => ( {
					suggestions: [
						{
							id: 'check-grammar',
							label: 'Check grammar',
							prompt: 'Check the grammar and spelling of this text',
						},
					],
					replaceEmptyViewSuggestions: true,
				} ),
			} )
		);
		jest.mocked( recordBigSkyTracksEvent ).mockClear();

		fireEvent.click( screen.getByText( 'Click block suggestion' ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_suggestion_click', {
			suggestion_text: 'Check the grammar and spelling of this text',
			suggestion_id: 'check-grammar',
			available_suggestions: '|check-grammar|',
			block_type: 'core/paragraph',
		} );
		expect( ( listener.mock.calls[ 0 ][ 0 ] as CustomEvent ).detail ).toEqual( {
			value: 'Check the grammar and spelling of this text',
			autoSubmit: false,
			suggestionId: 'check-grammar',
		} );

		window.removeEventListener( 'big-sky-inline-suggestion-click', listener );
	} );

	it( 'keeps suggestion clicks working when the block editor store cannot be read', () => {
		mockBlockEditorStoreThrows = true;

		render( chat() );
		fireEvent.click( screen.getByText( 'Click suggestion' ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'chat_suggestion_click',
			expect.objectContaining( { suggestion_id: 'simplify-text' } )
		);
	} );

	it( 'records the selected option and block context for a dropdown suggestion', () => {
		mockSelectedBlockType = 'core/paragraph';
		const listener = jest.fn();
		window.addEventListener( 'big-sky-inline-suggestion-click', listener );

		render(
			chat( {
				useSuggestions: () => ( {
					suggestions: [
						{
							id: 'change-tone',
							label: 'Change tone',
							prompt: '',
							options: [
								{
									id: 'formal',
									label: 'Formal',
									value: 'Change the tone of this text to be more formal',
								},
							],
						},
					],
					replaceEmptyViewSuggestions: true,
				} ),
			} )
		);
		jest.mocked( recordBigSkyTracksEvent ).mockClear();

		fireEvent.click( screen.getByText( 'Click block dropdown suggestion' ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_suggestion_click', {
			suggestion_text: 'Change the tone of this text to be more formal',
			suggestion_id: 'change-tone',
			available_suggestions: '|change-tone|',
			option_id: 'formal',
			block_type: 'core/paragraph',
		} );
		expect( ( listener.mock.calls[ 0 ][ 0 ] as CustomEvent ).detail ).toEqual( {
			value: 'Change the tone of this text to be more formal',
			autoSubmit: false,
			suggestionId: 'change-tone',
		} );

		window.removeEventListener( 'big-sky-inline-suggestion-click', listener );
	} );

	it( 'does not add block context to a post-level dropdown when a block is selected', () => {
		mockSelectedBlockType = 'core/paragraph';
		render( chat() );

		fireEvent.click( screen.getByText( 'Click post dropdown suggestion' ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_suggestion_click', {
			suggestion_text: 'Generate an SEO title for this post',
			suggestion_id: 'seo-enhancer',
			available_suggestions: '|seo-enhancer|',
			option_id: 'seo-title',
		} );
	} );

	it( 'passes the floating suggestion limit to external providers', () => {
		const useSuggestions = jest.fn( () => ( { suggestions: [] } ) );

		render( chat( { useSuggestions: useSuggestions } ) );

		expect( useSuggestions ).toHaveBeenCalledWith( 3 );
	} );

	it( 'does not limit external provider suggestions while docked', () => {
		const useSuggestions = jest.fn( () => ( { suggestions: [] } ) );

		render( chat( { isDocked: true, useSuggestions: useSuggestions } ) );

		expect( useSuggestions ).toHaveBeenCalledWith( undefined );
	} );

	it( 'uses the current Gutenberg block type when the selected block changes', () => {
		mockSelectedBlockType = 'core/paragraph';
		const useSuggestions = () => ( {
			suggestions: [
				{
					id: 'check-grammar',
					label: 'Check grammar',
					prompt: 'Check the grammar and spelling of this text',
				},
			],
			replaceEmptyViewSuggestions: true,
		} );
		const { rerender } = render( chat( { useSuggestions } ) );

		mockSelectedBlockType = 'core/heading';
		rerender( chat( { useSuggestions } ) );
		fireEvent.click( screen.getByText( 'Click block suggestion' ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenLastCalledWith( 'chat_suggestion_click', {
			suggestion_text: 'Check the grammar and spelling of this text',
			suggestion_id: 'check-grammar',
			available_suggestions: '|check-grammar|',
			block_type: 'core/heading',
		} );
	} );

	it( 'keeps showing the provider suggestions in the empty view after the store is cleared', () => {
		// Reproduces the regression where clicking a suggestion calls
		// clearSuggestions() (emptying the store) and the empty view then falls
		// back to the static defaults instead of the persistent provider list.
		const customSuggestions: Suggestion[] = [
			{ id: 'attention', label: 'What needs my attention today?', prompt: 'attention' },
		];
		const staticDefaults: Suggestion[] = [
			{ id: 'getting-started', label: 'Getting started with WordPress', prompt: 'getting-started' },
		];
		const useSuggestions = jest.fn( () => ( { suggestions: customSuggestions } ) );

		// Store is empty (as it is right after clearSuggestions()), no messages,
		// and the input is empty — the empty-view fallback branch.
		mockUseAgentChat.mockReturnValue( agentChatReturn() );
		mockUseImageUpload.mockReturnValue( createImageUpload() );
		mockIsReaderChatAgent.mockReturnValue( false );

		render( chat( { emptyViewSuggestions: staticDefaults, useSuggestions: useSuggestions } ) );

		expect( screen.getByText( 'What needs my attention today?' ) ).toBeTruthy();
		expect( screen.queryByText( 'Getting started with WordPress' ) ).toBeNull();
	} );

	it( 'combines provider empty-view suggestions with dynamic suggestions', () => {
		const emptySuggestions: Suggestion[] = [
			{ id: 'customize-colors', label: 'Customize colors', prompt: 'Customize colors' },
			{ id: 'change-page-layout', label: 'Change page layout', prompt: 'Change page layout' },
		];
		const dynamicSuggestions: Suggestion[] = [
			{ id: 'dynamic-action', label: 'Dynamic action', prompt: 'Run the dynamic action' },
		];
		const useSuggestions = jest.fn( () => ( { suggestions: dynamicSuggestions } ) );

		mockUseAgentChat.mockReturnValue( {
			addMessage: jest.fn(),
			messages: [],
			suggestions: dynamicSuggestions,
			isProcessing: false,
			error: null,
			loadMessages: jest.fn(),
			onSubmit: jest.fn(),
			abortCurrentRequest: jest.fn(),
			clearSuggestions: jest.fn(),
			registerSuggestions: jest.fn(),
			registerMessageActions: jest.fn(),
			progressMessage: null,
		} );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ emptySuggestions }
				isDocked={ false }
				isOpen
				suggestionsVisible
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
				chatHeaderOptions={ [] }
				markdownComponents={ {} }
				markdownExtensions={ {} }
				isCompactMode={ false }
				useSuggestions={ useSuggestions }
				onHasMessagesChange={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'Customize colors' ) ).toBeTruthy();
		expect( screen.getByText( 'Change page layout' ) ).toBeTruthy();
		expect( screen.getByText( 'Dynamic action' ) ).toBeTruthy();
	} );

	it( 'replaces provider empty-view suggestions with contextual dynamic suggestions', () => {
		mockSelectedBlockType = 'core/paragraph';
		const emptySuggestions: Suggestion[] = [
			{ id: 'simple-review', label: 'Simple Review', prompt: 'Review this page' },
			{ id: 'proofread', label: 'Proofread', prompt: 'Proofread this page' },
		];
		const blockSuggestions: Suggestion[] = [
			{ id: 'change-tone', label: 'Change tone', prompt: 'Change the tone' },
			{ id: 'check-grammar', label: 'Check grammar', prompt: 'Check the grammar' },
		];
		const useSuggestions = jest.fn( () => ( {
			suggestions: blockSuggestions,
			replaceEmptyViewSuggestions: true,
		} ) );

		mockUseAgentChat.mockReturnValue( {
			addMessage: jest.fn(),
			messages: [],
			suggestions: blockSuggestions,
			isProcessing: false,
			error: null,
			loadMessages: jest.fn(),
			onSubmit: jest.fn(),
			abortCurrentRequest: jest.fn(),
			clearSuggestions: jest.fn(),
			registerSuggestions: jest.fn(),
			registerMessageActions: jest.fn(),
			progressMessage: null,
		} );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ emptySuggestions }
				isDocked={ false }
				isOpen
				suggestionsVisible
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
				chatHeaderOptions={ [] }
				markdownComponents={ {} }
				markdownExtensions={ {} }
				isCompactMode={ false }
				useSuggestions={ useSuggestions }
				onHasMessagesChange={ jest.fn() }
			/>
		);

		expect( screen.queryByText( 'Simple Review' ) ).toBeNull();
		expect( screen.queryByText( 'Proofread' ) ).toBeNull();
		expect( screen.getByText( 'Change tone' ) ).toBeTruthy();
		expect( screen.getByText( 'Check grammar' ) ).toBeTruthy();
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_suggestions_rendered', {
			suggestions: '|change-tone|check-grammar|',
			block_type: 'core/paragraph',
		} );
	} );

	it( 'tracks the same contextual suggestions again when the selected block type changes', () => {
		mockSelectedBlockType = 'core/paragraph';
		const blockSuggestions: Suggestion[] = [
			{ id: 'change-tone', label: 'Change tone', prompt: 'Change the tone' },
			{ id: 'check-grammar', label: 'Check grammar', prompt: 'Check the grammar' },
		];
		const useSuggestions = jest.fn( () => ( {
			suggestions: blockSuggestions,
			replaceEmptyViewSuggestions: true,
		} ) );
		mockUseAgentChat.mockReturnValue( agentChatReturn( { suggestions: blockSuggestions } ) );

		const { rerender } = render( chat( { useSuggestions } ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenLastCalledWith( 'chat_suggestions_rendered', {
			suggestions: '|change-tone|check-grammar|',
			block_type: 'core/paragraph',
		} );
		rerender( chat( { useSuggestions } ) );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );

		mockSelectedBlockType = 'core/heading';
		rerender( chat( { useSuggestions } ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenLastCalledWith( 'chat_suggestions_rendered', {
			suggestions: '|change-tone|check-grammar|',
			block_type: 'core/heading',
		} );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not re-track lingering contextual suggestions when a block is deselected', () => {
		mockSelectedBlockType = 'core/paragraph';
		const blockSuggestions: Suggestion[] = [
			{ id: 'change-tone', label: 'Change tone', prompt: 'Change the tone' },
			{ id: 'check-grammar', label: 'Check grammar', prompt: 'Check the grammar' },
		];
		const useSuggestions = jest.fn( () => ( {
			suggestions: blockSuggestions,
			replaceEmptyViewSuggestions: true,
		} ) );
		mockUseAgentChat.mockReturnValue( agentChatReturn( { suggestions: blockSuggestions } ) );

		const { rerender } = render( chat( { useSuggestions } ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
		mockSelectedBlockType = undefined;
		rerender( chat( { useSuggestions } ) );
		mockSelectedBlockType = 'core/paragraph';
		rerender( chat( { useSuggestions } ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to the static empty-view suggestions when the provider has none', () => {
		const staticDefaults: Suggestion[] = [
			{ id: 'getting-started', label: 'Getting started with WordPress', prompt: 'getting-started' },
		];
		const useSuggestions = jest.fn( () => ( { suggestions: [] } ) );

		render( chat( { emptyViewSuggestions: staticDefaults, useSuggestions: useSuggestions } ) );

		expect( screen.getByText( 'Getting started with WordPress' ) ).toBeTruthy();
	} );

	it( 'does not add block context to non-contextual empty-view suggestions', () => {
		mockSelectedBlockType = 'core/paragraph';
		const staticDefaults: Suggestion[] = [
			{ id: 'getting-started', label: 'Getting started with WordPress', prompt: 'getting-started' },
		];

		render( chat( { emptyViewSuggestions: staticDefaults } ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_suggestions_rendered', {
			suggestions: '|getting-started|',
		} );
	} );

	it( 'tracks suggestions without block context when the block editor store is unavailable', () => {
		mockBlockEditorStoreThrows = true;
		const blockSuggestions: Suggestion[] = [
			{ id: 'check-grammar', label: 'Check grammar', prompt: 'Check the grammar' },
		];
		const useSuggestions = jest.fn( () => ( {
			suggestions: blockSuggestions,
			replaceEmptyViewSuggestions: true,
		} ) );
		mockUseAgentChat.mockReturnValue( agentChatReturn( { suggestions: blockSuggestions } ) );

		render( chat( { useSuggestions } ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_suggestions_rendered', {
			suggestions: '|check-grammar|',
		} );
	} );

	it( 'does not track chat_suggestions_rendered while the conversation is loading', () => {
		mockUseConversation.mockReturnValue( { isLoading: true } );
		const staticDefaults: Suggestion[] = [
			{ id: 'getting-started', label: 'Getting started with WordPress', prompt: 'getting-started' },
		];

		render( chat( { emptyViewSuggestions: staticDefaults } ) );

		expect( screen.queryByText( 'Getting started with WordPress' ) ).toBeNull();
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalledWith(
			'chat_suggestions_rendered',
			expect.anything()
		);
	} );

	it( 'does not track chat_suggestions_rendered while the chat is minimized', () => {
		const staticDefaults: Suggestion[] = [
			{ id: 'getting-started', label: 'Getting started with WordPress', prompt: 'getting-started' },
		];

		render(
			chat( { emptyViewSuggestions: staticDefaults, isOpen: false, suggestionsVisible: false } )
		);

		expect( screen.queryByText( 'Getting started with WordPress' ) ).toBeNull();
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalledWith(
			'chat_suggestions_rendered',
			expect.anything()
		);
	} );

	it( 'sends the message directly when no images are pending', async () => {
		const { onSubmit } = mockUseAgentChat();

		render( chat() );

		fireEvent.click( screen.getByText( 'Submit message' ) );

		await waitFor( () => {
			expect( onSubmit ).toHaveBeenCalledWith( 'Describe these images' );
		} );
	} );

	it( 'fires `file_upload_success` after images upload on send, with the uploaded media count', async () => {
		const uploadImagesToWordPress = jest.fn().mockResolvedValue( [
			{ id: 1, url: 'a' },
			{ id: 2, url: 'b' },
		] );

		renderWithImageUpload(
			createImageUpload( {
				pendingImages: [ { id: 'p1' }, { id: 'p2' } ],
				uploadImagesToWordPress,
			} )
		);

		fireEvent.click( screen.getByText( 'Submit message' ) );

		await waitFor( () => {
			expect( uploadImagesToWordPress ).toHaveBeenCalled();
			expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'file_upload_success', {
				count: 2,
			} );
		} );
	} );

	it( 'keeps the message in the input while uploading and clears it on dispatch', async () => {
		let resolveUpload!: ( media: Array< { id: number; url: string } > ) => void;
		const uploadImagesToWordPress = jest.fn(
			() =>
				new Promise( ( resolve ) => {
					resolveUpload = resolve;
				} )
		);
		const { onSubmit } = mockUseAgentChat();

		renderWithImageUpload(
			createImageUpload( {
				pendingImages: [ { id: 'p1' } ],
				uploadImagesToWordPress,
			} )
		);

		fireEvent.click( screen.getByText( 'Type message' ) );
		fireEvent.click( screen.getByText( 'Submit message' ) );

		await waitFor( () => {
			expect( screen.getByTestId( 'input-value' ) ).toHaveTextContent( 'Describe these images' );
		} );

		await act( async () => {
			resolveUpload( [ { id: 1, url: 'a' } ] );
		} );

		expect( screen.getByTestId( 'input-value' ) ).toBeEmptyDOMElement();
		expect( onSubmit ).toHaveBeenCalledWith(
			'Describe these images',
			expect.objectContaining( { imageUrls: expect.any( Array ) } )
		);
	} );

	it( 'tracks `file_upload_cancel` and skips dispatch when the upload is aborted', async () => {
		const abortError = new Error( 'Image upload aborted' );
		abortError.name = 'AbortError';
		const { onSubmit } = mockUseAgentChat();

		renderWithImageUpload(
			createImageUpload( {
				pendingImages: [ { id: 'p1' } ],
				uploadImagesToWordPress: jest.fn().mockRejectedValue( abortError ),
			} )
		);

		fireEvent.click( screen.getByText( 'Submit message' ) );

		await waitFor( () => {
			expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'file_upload_cancel', {
				count: 1,
			} );
		} );
		expect( onSubmit ).not.toHaveBeenCalled();
	} );

	it( 'surfaces an upload error and skips dispatch when the upload fails', async () => {
		const { onSubmit } = mockUseAgentChat();

		renderWithImageUpload(
			createImageUpload( {
				pendingImages: [ { id: 'p1' } ],
				uploadImagesToWordPress: jest.fn().mockRejectedValue( new Error( 'network' ) ),
			} )
		);

		fireEvent.click( screen.getByText( 'Submit message' ) );

		await waitFor( () => {
			expect( screen.getByTestId( 'chat-error' ) ).toHaveTextContent(
				'Failed to upload images. Please try again.'
			);
		} );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'file_upload_error', {
			count: 1,
		} );
		expect( onSubmit ).not.toHaveBeenCalled();
	} );

	it( 'restores the message when dispatch fails after a successful upload', async () => {
		const uploadImagesToWordPress = jest.fn().mockResolvedValue( [ { id: 1, url: 'a' } ] );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				onSubmit: jest.fn().mockRejectedValue( new Error( 'dispatch failed' ) ),
			} )
		);

		renderWithImageUpload(
			createImageUpload( {
				pendingImages: [ { id: 'p1' } ],
				uploadImagesToWordPress,
			} )
		);

		fireEvent.click( screen.getByText( 'Type message' ) );
		fireEvent.click( screen.getByText( 'Submit message' ) );

		await waitFor( () => {
			expect( mockUseAgentChat().onSubmit ).toHaveBeenCalled();
		} );
		await waitFor( () => {
			expect( screen.getByTestId( 'input-value' ) ).toHaveTextContent( 'Describe these images' );
		} );
	} );

	it( 'restores the message when a text-only dispatch fails', async () => {
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				onSubmit: jest.fn().mockRejectedValue( new Error( 'dispatch failed' ) ),
			} )
		);

		render( chat() );

		fireEvent.click( screen.getByText( 'Type message' ) );
		fireEvent.click( screen.getByText( 'Submit message' ) );

		await waitFor( () => {
			expect( mockUseAgentChat().onSubmit ).toHaveBeenCalled();
		} );
		await waitFor( () => {
			expect( screen.getByTestId( 'input-value' ) ).toHaveTextContent( 'Describe these images' );
		} );
	} );

	it( 'stops the upload instead of the agent request while images are uploading', () => {
		const abortUpload = jest.fn( () => true );
		const { abortCurrentRequest } = mockUseAgentChat();

		renderWithImageUpload(
			createImageUpload( {
				uploadingImages: [ { id: 'p1' } ],
				isUploadingImages: true,
				abortUpload,
			} )
		);

		fireEvent.click( screen.getByText( 'Stop' ) );

		expect( abortUpload ).toHaveBeenCalled();
		expect( abortCurrentRequest ).not.toHaveBeenCalled();
	} );

	it( 'stops the agent request when no upload is in flight', () => {
		const { abortCurrentRequest } = mockUseAgentChat();

		renderWithImageUpload( createImageUpload() );

		fireEvent.click( screen.getByText( 'Stop' ) );

		expect( abortCurrentRequest ).toHaveBeenCalled();
	} );

	it( 'drops a same-tick duplicate send before upload state propagates', async () => {
		const uploadImagesToWordPress = jest.fn(
			() => new Promise( () => {} ) // stays pending
		);

		renderWithImageUpload(
			createImageUpload( {
				pendingImages: [ { id: 'p1' } ],
				uploadImagesToWordPress,
			} )
		);

		fireEvent.click( screen.getByText( 'Submit message' ) );
		fireEvent.click( screen.getByText( 'Submit message' ) );

		await waitFor( () => {
			expect( uploadImagesToWordPress ).toHaveBeenCalledTimes( 1 );
		} );
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalledWith(
			'file_upload_error',
			expect.anything()
		);
	} );

	it( 'drops sends while an upload is in flight', () => {
		const uploadImagesToWordPress = jest.fn();

		renderWithImageUpload(
			createImageUpload( {
				uploadingImages: [ { id: 'p1' } ],
				isUploadingImages: true,
				uploadImagesToWordPress,
			} )
		);

		fireEvent.click( screen.getByText( 'Submit message' ) );

		expect( uploadImagesToWordPress ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalledWith(
			'chat_input_send_message',
			expect.anything()
		);
	} );

	it( 'ignores staged images on reader chat', async () => {
		mockIsReaderChatAgent.mockReturnValue( true );
		const uploadImagesToWordPress = jest.fn();
		const { onSubmit } = mockUseAgentChat();

		renderWithImageUpload(
			createImageUpload( {
				pendingImages: [ { id: 'p1' } ],
				uploadImagesToWordPress,
			} )
		);

		fireEvent.click( screen.getByText( 'Submit message' ) );

		await waitFor( () => {
			expect( onSubmit ).toHaveBeenCalledWith( 'Describe these images' );
		} );
		expect( uploadImagesToWordPress ).not.toHaveBeenCalled();
	} );

	it( 'keeps regenerate disabled unless a provider opts in', () => {
		render( chat() );

		expect( mockUseRegenerateAction ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: false } )
		);
	} );

	it( 'derives and deduplicates checkpoint actions for synthetic streaming messages', () => {
		const checkpointAction = {
			id: 'checkpoint',
			label: 'Undo',
			onClick: jest.fn(),
			order: 1,
		};
		const createOutcomeMessage = ( id: string, actions?: unknown[] ) => ( {
			id,
			role: 'agent',
			content: [
				{
					type: 'text',
					text: JSON.stringify( {
						tool_id: 'big_sky__apply_block_edits',
						tool_call_id: 'tool-call-1',
						data: {
							result: { success: true, outcome: 'updated', message: 'Updated the block.' },
						},
					} ),
				},
			],
			timestamp: 1,
			archived: false,
			showIcon: true,
			...( actions ? { actions } : {} ),
		} );
		const getCheckpointActions = jest.fn( ( message: { id: string } ) =>
			message.id === 'agent-streaming-stale' ? [] : [ checkpointAction ]
		);
		mockUseCheckpointAction.mockReturnValue( getCheckpointActions );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				messages: [
					createOutcomeMessage( 'agent-streaming-new' ),
					createOutcomeMessage( 'agent-streaming-duplicate', [
						{ ...checkpointAction, label: 'Old Undo' },
					] ),
					createOutcomeMessage( 'agent-streaming-stale', [ checkpointAction ] ),
				],
			} )
		);

		render( chat() );

		const messages = mockAgentChat.mock.calls[ 0 ][ 0 ].messages as Array< {
			id: string;
			actions?: Array< { id: string; label: string } >;
		} >;
		const getCheckpointActionsFromMessage = ( id: string ) =>
			messages
				.find( ( message ) => message.id === id )
				?.actions?.filter( ( action ) => action.id === 'checkpoint' ) ?? [];

		expect( getCheckpointActionsFromMessage( 'agent-streaming-new' ) ).toEqual( [
			expect.objectContaining( { id: 'checkpoint', label: 'Undo' } ),
		] );
		expect( getCheckpointActionsFromMessage( 'agent-streaming-duplicate' ) ).toEqual( [
			expect.objectContaining( { id: 'checkpoint', label: 'Undo' } ),
		] );
		expect( getCheckpointActionsFromMessage( 'agent-streaming-stale' ) ).toEqual( [] );
		expect( getCheckpointActions ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: 'agent-streaming-new',
				content: expect.arrayContaining( [
					expect.objectContaining( {
						text: expect.stringContaining( 'big_sky__apply_block_edits' ),
					} ),
				] ),
			} )
		);
	} );

	it( 'hides checkpoint controls after a later user message', () => {
		const checkpointMessage = createCheckpointMessage( 'agent-checkpoint', 'history-checkpoint' );
		mockCheckpointActions();
		const initialMessages = [ userMessage, checkpointMessage ];
		mockUseAgentChat.mockReturnValue( agentChatReturn( { messages: initialMessages } ) );
		const view = render( chat() );

		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps ).toHaveProperty(
			'onUndo'
		);

		const contextOnlyMessage = {
			id: 'context-only',
			role: 'user',
			content: [ { type: 'context' } ],
			timestamp: 2,
		};
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ ...initialMessages, contextOnlyMessage ] } )
		);
		view.rerender( chat() );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps ).toHaveProperty(
			'onUndo'
		);

		const nextUserMessage = {
			id: 'user-2',
			role: 'user',
			content: [ { type: 'text', text: 'Make another edit' } ],
			timestamp: 3,
		};
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ ...initialMessages, contextOnlyMessage, nextUserMessage ] } )
		);
		view.rerender( chat() );

		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onRedo' );
	} );

	it( 'hides checkpoint controls in loaded conversation history', () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-history',
			`loaded-history-checkpoint-${ Date.now() }`
		);
		const checkpointId = mockGetCheckpointIdForMessage( checkpointMessage )!;
		const checkpointResult = checkpointMessage.content[ 0 ].text;
		const loadMessages = jest.fn();
		mockUseAgentChat.mockReturnValue( agentChatReturn( { loadMessages } ) );

		render( chat() );
		act( () => {
			mockConversationConfig?.onSuccess?.(
				[
					{
						messageId: checkpointMessage.id,
						role: 'agent',
						parts: [ { type: 'text', text: checkpointResult } ],
						kind: 'message',
					},
				],
				'history-session'
			);
		} );

		expect( mockInvalidateCheckpointAction ).toHaveBeenCalledWith( checkpointId );
		expect( loadMessages ).toHaveBeenCalledWith(
			expect.arrayContaining( [ expect.objectContaining( { messageId: checkpointMessage.id } ) ] )
		);
	} );

	it( 'updates the checkpoint status when native Undo and Redo stores notify separately', () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-native-undo',
			'native-undo-checkpoint'
		);
		let canSwapCheckpoint = true;
		const checkpoint = {
			getLastEditorState: jest.fn(),
			setCheckpoint: jest.fn(),
			addCheckpointKeys: jest.fn(),
			restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
			canSwapCheckpoint: jest.fn( () => canSwapCheckpoint ),
			swapCheckpoint: jest.fn().mockResolvedValue( undefined ),
			addNewPageToCheckpoint: jest.fn(),
			addPageRenameToCheckpoint: jest.fn(),
			addPageRemovalToCheckpoint: jest.fn(),
			getLatestUserMessageId: jest.fn(),
			clearCheckpoint: jest.fn(),
			hasCheckpoint: jest.fn().mockReturnValue( true ),
		};
		const useCheckpoint = () => checkpoint;
		mockCheckpointActions();
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		render( chat( { useCheckpoint } ) );

		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe(
			'Updated and Undo'
		);
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps ).toHaveProperty(
			'onUndo'
		);

		act( () => {
			mockHasEditorRedo = true;
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onRedo' );
		expect( mockInvalidateCheckpointAction ).not.toHaveBeenCalledWith( 'native-undo-checkpoint' );

		act( () => {
			canSwapCheckpoint = false;
			mockEditorBlocks = [ { clientId: 'native-undo-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Reverted' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onRedo' );
		expect( mockInvalidateCheckpointAction ).toHaveBeenCalledWith( 'native-undo-checkpoint' );

		act( () => {
			mockHasEditorRedo = false;
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Reverted' );

		act( () => {
			canSwapCheckpoint = true;
			mockEditorBlocks = [ { clientId: 'native-redo-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onRedo' );
		expect( mockInvalidateCheckpointAction ).toHaveBeenLastCalledWith( 'native-undo-checkpoint' );
	} );

	it( 'updates the checkpoint status when native Undo stores notify together', () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-native-undo-combined',
			'native-undo-combined-checkpoint'
		);
		let canSwapCheckpoint = true;
		const checkpoint = {
			getLastEditorState: jest.fn(),
			setCheckpoint: jest.fn(),
			addCheckpointKeys: jest.fn(),
			restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
			canSwapCheckpoint: jest.fn( () => canSwapCheckpoint ),
			swapCheckpoint: jest.fn().mockResolvedValue( undefined ),
			addNewPageToCheckpoint: jest.fn(),
			addPageRenameToCheckpoint: jest.fn(),
			addPageRemovalToCheckpoint: jest.fn(),
			getLatestUserMessageId: jest.fn(),
			clearCheckpoint: jest.fn(),
			hasCheckpoint: jest.fn().mockReturnValue( true ),
		};
		const useCheckpoint = () => checkpoint;
		mockCheckpointActions();
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		render( chat( { useCheckpoint } ) );

		act( () => {
			mockHasEditorRedo = true;
			canSwapCheckpoint = false;
			mockEditorBlocks = [ { clientId: 'native-undo-combined-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );

		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Reverted' );
		expect( mockSetCheckpointActionReverted ).toHaveBeenCalledWith(
			'native-undo-combined-checkpoint',
			true
		);
	} );

	it( 'keeps a source-drifted checkpoint Updated across later native history', () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-source-drift-native-history',
			'source-drift-native-history-checkpoint'
		);
		let canSwapCheckpoint = true;
		const checkpoint = {
			getLastEditorState: jest.fn(),
			setCheckpoint: jest.fn(),
			addCheckpointKeys: jest.fn(),
			restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
			canSwapCheckpoint: jest.fn( () => canSwapCheckpoint ),
			swapCheckpoint: jest.fn().mockResolvedValue( undefined ),
			addNewPageToCheckpoint: jest.fn(),
			addPageRenameToCheckpoint: jest.fn(),
			addPageRemovalToCheckpoint: jest.fn(),
			getLatestUserMessageId: jest.fn(),
			clearCheckpoint: jest.fn(),
			hasCheckpoint: jest.fn().mockReturnValue( true ),
		};
		const useCheckpoint = () => checkpoint;
		mockCheckpointActions();
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		const view = render( chat( { useCheckpoint } ) );

		canSwapCheckpoint = false;
		mockEditorBlocks = [ { clientId: 'manually-drifted-block' } ];
		view.rerender( chat( { useCheckpoint } ) );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );

		mockHasEditorRedo = true;
		view.rerender( chat( { useCheckpoint } ) );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );

		canSwapCheckpoint = true;
		mockEditorBlocks = [ { clientId: 'restored-ai-state-block' } ];
		view.rerender( chat( { useCheckpoint } ) );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );

		mockHasEditorRedo = false;
		view.rerender( chat( { useCheckpoint } ) );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );
		expect( mockSetCheckpointActionReverted ).not.toHaveBeenCalledWith(
			'source-drift-native-history-checkpoint',
			true
		);
	} );

	it( 'does not treat later source drift as a delayed native Undo', () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-unrelated-native-history',
			'unrelated-native-history-checkpoint'
		);
		let canSwapCheckpoint = true;
		const checkpoint = {
			getLastEditorState: jest.fn(),
			setCheckpoint: jest.fn(),
			addCheckpointKeys: jest.fn(),
			restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
			canSwapCheckpoint: jest.fn( () => canSwapCheckpoint ),
			swapCheckpoint: jest.fn().mockResolvedValue( undefined ),
			addNewPageToCheckpoint: jest.fn(),
			addPageRenameToCheckpoint: jest.fn(),
			addPageRemovalToCheckpoint: jest.fn(),
			getLatestUserMessageId: jest.fn(),
			clearCheckpoint: jest.fn(),
			hasCheckpoint: jest.fn().mockReturnValue( true ),
		};
		const useCheckpoint = () => checkpoint;
		mockCheckpointActions();
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		render( chat( { useCheckpoint } ) );

		act( () => {
			mockHasEditorRedo = true;
			mockEditorBlocks = [ { clientId: 'unrelated-native-undo-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onRedo' );

		act( () => {
			mockEditorBlocks = [ { clientId: 'settled-unrelated-native-undo-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe(
			'Updated and Undo'
		);
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps ).toHaveProperty(
			'onUndo'
		);

		act( () => {
			canSwapCheckpoint = false;
			mockEditorBlocks = [ { clientId: 'later-source-drift-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onRedo' );
		expect( mockInvalidateCheckpointAction ).toHaveBeenCalledWith(
			'unrelated-native-history-checkpoint'
		);
		expect( mockSetCheckpointActionReverted ).not.toHaveBeenCalledWith(
			'unrelated-native-history-checkpoint',
			true
		);

		act( () => {
			canSwapCheckpoint = true;
			mockEditorBlocks = [ { clientId: 'later-restored-ai-state-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onRedo' );
	} );

	it( 'does not mark an unsupported checkpoint Reverted after native Undo', () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-unsupported-native-undo',
			'unsupported-native-undo-checkpoint'
		);
		const checkpoint = {
			getLastEditorState: jest.fn(),
			setCheckpoint: jest.fn(),
			addCheckpointKeys: jest.fn(),
			restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
			addNewPageToCheckpoint: jest.fn(),
			addPageRenameToCheckpoint: jest.fn(),
			addPageRemovalToCheckpoint: jest.fn(),
			getLatestUserMessageId: jest.fn(),
			clearCheckpoint: jest.fn(),
			hasCheckpoint: jest.fn().mockReturnValue( true ),
		};
		const useCheckpoint = () => checkpoint;
		mockCheckpointActions();
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		render( chat( { useCheckpoint } ) );

		act( () => {
			mockHasEditorRedo = true;
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );

		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );
		expect( mockSetCheckpointActionReverted ).not.toHaveBeenCalledWith(
			'unsupported-native-undo-checkpoint',
			true
		);
	} );

	it( 'hides checkpoint controls when the editor content drifts without Gutenberg Undo', async () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-editor-drift',
			'editor-drift-checkpoint',
			'text-content'
		);
		let canSwapCheckpoint = true;
		const checkpoint = {
			getLastEditorState: jest.fn(),
			setCheckpoint: jest.fn(),
			addCheckpointKeys: jest.fn(),
			restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
			canSwapCheckpoint: jest.fn( () => canSwapCheckpoint ),
			swapCheckpoint: jest.fn().mockResolvedValue( undefined ),
			addNewPageToCheckpoint: jest.fn(),
			addPageRenameToCheckpoint: jest.fn(),
			addPageRemovalToCheckpoint: jest.fn(),
			getLatestUserMessageId: jest.fn(),
			clearCheckpoint: jest.fn(),
			hasCheckpoint: jest.fn().mockReturnValue( true ),
		};
		const useCheckpoint = () => checkpoint;
		const actualUseCheckpointAction = jest.requireActual(
			'../../hooks/use-checkpoint-action'
		).default;
		mockUseCheckpointAction.mockImplementation( actualUseCheckpointAction );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		render( chat( { useCheckpoint } ) );

		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps ).toHaveProperty(
			'onUndo'
		);

		act( () => {
			canSwapCheckpoint = false;
			mockEditorBlocks = [ { clientId: 'edited-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );

		expect( checkpoint.canSwapCheckpoint ).toHaveBeenLastCalledWith( 'editor-drift-checkpoint' );
		expect( mockInvalidateCheckpointAction ).toHaveBeenCalledWith( 'editor-drift-checkpoint' );
		const actionAfterDrift = getDisplayedCheckpointAction( checkpointMessage.id );
		expect( actionAfterDrift?.label ).toBe( 'Updated' );
		const staleOnUndo = actionAfterDrift?.componentProps?.onUndo;
		// Exercise the unfixed path so the failed-event assertion below is meaningful.
		if ( typeof staleOnUndo === 'function' ) {
			await act( async () => staleOnUndo() );
		}
		expect( actionAfterDrift?.componentProps ).not.toHaveProperty( 'onUndo' );
		expect( actionAfterDrift?.componentProps ).not.toHaveProperty( 'onRedo' );
		expect( checkpoint.swapCheckpoint ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalledWith(
			'restore_checkpoint_action',
			expect.objectContaining( { id: 'editor-drift-checkpoint', outcome: 'failed' } )
		);

		const canSwapCallCount = checkpoint.canSwapCheckpoint.mock.calls.length;
		act( () => {
			canSwapCheckpoint = true;
			mockEditorBlocks = [ { clientId: 'edited-again' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );
		expect( checkpoint.canSwapCheckpoint ).toHaveBeenCalledTimes( canSwapCallCount );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
	} );

	it( 'removes a stale rendered Undo when drift is detected on click', async () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-stale-click',
			'stale-click-checkpoint',
			'text-content'
		);
		let canSwapCheckpoint = true;
		const checkpoint = {
			getLastEditorState: jest.fn(),
			setCheckpoint: jest.fn(),
			addCheckpointKeys: jest.fn(),
			restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
			canSwapCheckpoint: jest.fn( () => canSwapCheckpoint ),
			swapCheckpoint: jest.fn().mockResolvedValue( undefined ),
			addNewPageToCheckpoint: jest.fn(),
			addPageRenameToCheckpoint: jest.fn(),
			addPageRemovalToCheckpoint: jest.fn(),
			getLatestUserMessageId: jest.fn(),
			clearCheckpoint: jest.fn(),
			hasCheckpoint: jest.fn().mockReturnValue( true ),
		};
		const useCheckpoint = () => checkpoint;
		const actualUseCheckpointAction = jest.requireActual(
			'../../hooks/use-checkpoint-action'
		).default;
		mockUseCheckpointAction.mockImplementation( actualUseCheckpointAction );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		render( chat( { useCheckpoint } ) );

		const staleOnUndo = getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
			?.onUndo;
		if ( typeof staleOnUndo !== 'function' ) {
			throw new Error( 'Expected an Undo action.' );
		}

		canSwapCheckpoint = false;
		await act( async () => staleOnUndo() );

		expect( checkpoint.swapCheckpoint ).not.toHaveBeenCalled();
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Updated' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'keeps checkpoint controls while Undo swaps the editor content', async () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-checkpoint-swap',
			'checkpoint-swap',
			'text-content'
		);
		let canSwapCheckpoint = true;
		let resolveSwap: ( () => void ) | undefined;
		const checkpoint = {
			getLastEditorState: jest.fn(),
			setCheckpoint: jest.fn(),
			addCheckpointKeys: jest.fn(),
			restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
			canSwapCheckpoint: jest.fn( () => canSwapCheckpoint ),
			swapCheckpoint: jest.fn(
				() =>
					new Promise< void >( ( resolve ) => {
						canSwapCheckpoint = false;
						mockEditorBlocks = [ { clientId: 'restored-block' } ];
						mockDataStoreSubscribers.forEach( ( notify ) => notify() );
						resolveSwap = () => {
							canSwapCheckpoint = true;
							resolve();
						};
					} )
			),
			addNewPageToCheckpoint: jest.fn(),
			addPageRenameToCheckpoint: jest.fn(),
			addPageRemovalToCheckpoint: jest.fn(),
			getLatestUserMessageId: jest.fn(),
			clearCheckpoint: jest.fn(),
			hasCheckpoint: jest.fn().mockReturnValue( true ),
		};
		const useCheckpoint = () => checkpoint;
		const actualUseCheckpointAction = jest.requireActual(
			'../../hooks/use-checkpoint-action'
		).default;
		mockUseCheckpointAction.mockImplementation( actualUseCheckpointAction );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		render( chat( { useCheckpoint } ) );

		const onUndo = getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps?.onUndo;
		if ( typeof onUndo !== 'function' ) {
			throw new Error( 'Expected an Undo action.' );
		}

		let undoPromise!: Promise< boolean >;
		act( () => {
			undoPromise = onUndo() as Promise< boolean >;
		} );
		await act( async () => Promise.resolve() );

		expect( mockInvalidateCheckpointAction ).not.toHaveBeenCalledWith( 'checkpoint-swap' );
		await expect( onUndo() ).resolves.toBe( false );
		expect( checkpoint.swapCheckpoint ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps ).toHaveProperty(
			'onUndo'
		);

		await act( async () => {
			resolveSwap?.();
			await undoPromise;
		} );

		await waitFor( () => {
			const revertedAction = getDisplayedCheckpointAction( checkpointMessage.id );
			expect( revertedAction?.label ).toBe( 'Reverted and Redo' );
			expect( revertedAction?.componentProps ).toHaveProperty( 'onRedo' );
		} );
		expect( mockInvalidateCheckpointAction ).not.toHaveBeenCalledWith( 'checkpoint-swap' );
	} );

	it( 'keeps Redo when an inline Undo creates Gutenberg redo history', async () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-inline-undo',
			'inline-undo-checkpoint',
			'text-content'
		);
		const checkpoint = {
			getLastEditorState: jest.fn(),
			setCheckpoint: jest.fn(),
			addCheckpointKeys: jest.fn(),
			restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
			canSwapCheckpoint: jest.fn().mockReturnValue( true ),
			swapCheckpoint: jest.fn( () => {
				mockHasEditorRedo = true;
				mockEditorBlocks = [ { clientId: 'inline-undo-restored-block' } ];
				mockDataStoreSubscribers.forEach( ( notify ) => notify() );
				return Promise.resolve();
			} ),
			addNewPageToCheckpoint: jest.fn(),
			addPageRenameToCheckpoint: jest.fn(),
			addPageRemovalToCheckpoint: jest.fn(),
			getLatestUserMessageId: jest.fn(),
			clearCheckpoint: jest.fn(),
			hasCheckpoint: jest.fn().mockReturnValue( true ),
		};
		const useCheckpoint = () => checkpoint;
		const actualUseCheckpointAction = jest.requireActual(
			'../../hooks/use-checkpoint-action'
		).default;
		mockUseCheckpointAction.mockImplementation( actualUseCheckpointAction );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		render( chat( { useCheckpoint } ) );

		const onUndo = getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps?.onUndo;
		if ( typeof onUndo !== 'function' ) {
			throw new Error( 'Expected an Undo action.' );
		}

		await act( async () => {
			await onUndo();
		} );

		await waitFor( () => {
			const revertedAction = getDisplayedCheckpointAction( checkpointMessage.id );
			expect( revertedAction?.label ).toBe( 'Reverted and Redo' );
			expect( revertedAction?.componentProps ).toHaveProperty( 'onRedo' );
		} );
		expect( mockInvalidateCheckpointAction ).not.toHaveBeenCalledWith( 'inline-undo-checkpoint' );
	} );

	it( 'keeps an earlier Redo when Gutenberg history updates after inline Undo completes', async () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-delayed-inline-undo',
			'delayed-inline-undo-checkpoint',
			'text-content'
		);
		const laterCheckpointMessage = createCheckpointMessage(
			'agent-later-checkpoint',
			'later-checkpoint',
			'text-content'
		);
		const checkpoint = createSwappableCheckpoint();
		checkpoint.swapCheckpoint.mockImplementation( () => {
			mockHasEditorRedo = true;
			return Promise.resolve();
		} );
		const useCheckpoint = () => checkpoint;
		const actualUseCheckpointAction = jest.requireActual(
			'../../hooks/use-checkpoint-action'
		).default;
		mockUseCheckpointAction.mockImplementation( actualUseCheckpointAction );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				messages: [ userMessage, checkpointMessage, laterCheckpointMessage ],
			} )
		);
		render( chat( { useCheckpoint } ) );

		const onUndo = getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps?.onUndo;
		if ( typeof onUndo !== 'function' ) {
			throw new Error( 'Expected an Undo action.' );
		}

		await act( async () => {
			await onUndo();
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe(
			'Reverted and Redo'
		);

		act( () => {
			mockEditorBlocks = [ { clientId: 'delayed-inline-undo-restored-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );

		const revertedAction = getDisplayedCheckpointAction( checkpointMessage.id );
		expect( revertedAction?.label ).toBe( 'Reverted and Redo' );
		expect( revertedAction?.componentProps ).toHaveProperty( 'onRedo' );
		expect( getDisplayedCheckpointAction( laterCheckpointMessage.id )?.label ).toBe(
			'Updated and Undo'
		);
		expect( mockInvalidateCheckpointAction ).not.toHaveBeenCalledWith(
			'delayed-inline-undo-checkpoint'
		);
		expect( mockInvalidateCheckpointAction ).not.toHaveBeenCalledWith( 'later-checkpoint' );
	} );

	it( 'does not attribute a later native Undo to an inline Undo without editor history', async () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-inline-undo-without-history',
			'inline-undo-without-history-checkpoint',
			'text-content'
		);
		const laterCheckpointMessage = createCheckpointMessage(
			'agent-later-native-undo',
			'later-native-undo-checkpoint',
			'text-content'
		);
		let canSwapLaterCheckpoint = true;
		const checkpoint = createSwappableCheckpoint();
		checkpoint.canSwapCheckpoint.mockImplementation( ( checkpointId: string ) =>
			checkpointId === 'later-native-undo-checkpoint' ? canSwapLaterCheckpoint : true
		);
		const useCheckpoint = () => checkpoint;
		const actualUseCheckpointAction = jest.requireActual(
			'../../hooks/use-checkpoint-action'
		).default;
		mockUseCheckpointAction.mockImplementation( actualUseCheckpointAction );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				messages: [ userMessage, checkpointMessage, laterCheckpointMessage ],
			} )
		);
		render( chat( { useCheckpoint } ) );

		const onUndo = getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps?.onUndo;
		if ( typeof onUndo !== 'function' ) {
			throw new Error( 'Expected an Undo action.' );
		}
		await act( async () => {
			await onUndo();
		} );
		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe(
			'Reverted and Redo'
		);

		act( () => {
			canSwapLaterCheckpoint = false;
			mockHasEditorRedo = true;
			mockEditorBlocks = [ { clientId: 'later-native-undo-block' } ];
			mockDataStoreSubscribers.forEach( ( notify ) => notify() );
		} );

		expect( getDisplayedCheckpointAction( checkpointMessage.id )?.label ).toBe( 'Reverted' );
		expect( mockSetCheckpointActionReverted ).toHaveBeenCalledWith(
			'later-native-undo-checkpoint',
			true
		);
		expect( mockInvalidateCheckpointAction ).toHaveBeenCalledWith(
			'inline-undo-without-history-checkpoint'
		);
		expect( mockInvalidateCheckpointAction ).toHaveBeenCalledWith( 'later-native-undo-checkpoint' );
	} );

	it( 'invalidates a checkpoint that arrives after Gutenberg Undo', () => {
		const checkpointMessage = createCheckpointMessage(
			'agent-late-checkpoint',
			'late-native-undo-checkpoint'
		);
		mockCheckpointActions();
		mockUseAgentChat.mockReturnValue( agentChatReturn( { messages: [ userMessage ] } ) );
		const view = render( chat() );

		mockHasEditorRedo = true;
		view.rerender( chat() );
		mockHasEditorRedo = false;
		view.rerender( chat() );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, checkpointMessage ] } )
		);
		view.rerender( chat() );

		expect( mockInvalidateCheckpointAction ).toHaveBeenCalledWith( 'late-native-undo-checkpoint' );
		expect(
			getDisplayedCheckpointAction( checkpointMessage.id )?.componentProps
		).not.toHaveProperty( 'onUndo' );
	} );

	it( 'allows checkpoint controls on a later user turn', () => {
		const firstCheckpoint = createCheckpointMessage( 'agent-first-turn', 'first-turn-checkpoint' );
		const secondCheckpoint = createCheckpointMessage(
			'agent-second-turn',
			'second-turn-checkpoint'
		);
		mockCheckpointActions();
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, firstCheckpoint ] } )
		);
		const view = render( chat() );

		mockHasEditorRedo = true;
		view.rerender( chat() );
		mockHasEditorRedo = false;
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				messages: [
					userMessage,
					firstCheckpoint,
					{
						id: 'user-second-turn',
						role: 'user',
						content: [ { type: 'text', text: 'Make another edit' } ],
						timestamp: 2,
					},
					secondCheckpoint,
				],
			} )
		);
		view.rerender( chat() );

		expect( getDisplayedCheckpointAction( secondCheckpoint.id )?.componentProps ).toHaveProperty(
			'onUndo'
		);
	} );

	it( 'keeps streamed checkpoint actions through final prose and remounts', async () => {
		mockCheckpointActions();
		const view = render( chat() );
		const checkpointResult = JSON.stringify( {
			tool_id: 'big_sky__apply_block_edits',
			tool_call_id: 'tool-call-streamed',
			data: {
				result: {
					success: true,
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );
		await act( async () => {
			await mockAgentChatConfig?.onTaskUpdate?.( {
				id: 'task-streamed',
				status: { state: 'working' },
				text: checkpointResult,
				final: false,
				kind: 'status',
			} );
			await mockAgentChatConfig?.onTaskUpdate?.( {
				id: 'task-streamed',
				status: {
					state: 'completed',
					message: { messageId: 'agent-final', role: 'agent', kind: 'message', parts: [] },
				},
				text: 'The paragraph has been updated.',
				final: true,
				kind: 'status',
			} );
		} );

		const finalMessage = {
			id: 'agent-final',
			role: 'agent' as const,
			content: [ { type: 'text' as const, text: 'The paragraph has been updated.' } ],
			timestamp: 1,
			archived: false,
			showIcon: true,
		};
		mockUseAgentChat.mockReturnValue( agentChatReturn( { messages: [ finalMessage ] } ) );
		view.rerender( chat() );

		const messages = mockAgentChat.mock.calls.at( -1 )![ 0 ].messages as Array< {
			id: string;
			actions?: Array< { id: string; label: string } >;
		} >;
		expect( messages[ 0 ].actions ).toEqual( [
			expect.objectContaining( { id: 'checkpoint', label: 'Updated and Undo' } ),
		] );
		view.unmount();

		const remountedView = render( chat() );
		const remountedMessages = mockAgentChat.mock.calls.at( -1 )![ 0 ].messages as Array< {
			actions?: Array< { id: string; label: string } >;
		} >;
		expect( remountedMessages[ 0 ].actions ).toEqual( [
			expect.objectContaining( { id: 'checkpoint', label: 'Updated and Undo' } ),
		] );

		const regenerateConfig = mockUseRegenerateAction.mock.calls.at( -1 )![ 0 ] as {
			getRegenerateHandler?: ( message: unknown ) => ( () => Promise< void > ) | null | undefined;
		};
		await act( async () => {
			await regenerateConfig.getRegenerateHandler?.( finalMessage )?.();
		} );
		remountedView.rerender( chat() );

		const restoredMessages = mockAgentChat.mock.calls.at( -1 )![ 0 ].messages as Array< {
			actions?: Array< { id: string; label: string } >;
		} >;
		expect( restoredMessages[ 0 ].actions ).toEqual( [
			expect.objectContaining( { id: 'checkpoint', label: 'Updated and Undo' } ),
		] );

		let resolveRegenerate!: () => void;
		const regeneration = new Promise< void >( ( resolve ) => {
			resolveRegenerate = resolve;
		} );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				messages: [ finalMessage ],
				getRegenerateHandler: jest.fn( () => () => regeneration ),
			} )
		);
		remountedView.rerender( chat() );
		const successfulRegenerateConfig = mockUseRegenerateAction.mock.calls.at( -1 )![ 0 ] as {
			getRegenerateHandler?: ( message: unknown ) => ( () => Promise< void > ) | null | undefined;
		};
		await act( async () => {
			const regenerate = successfulRegenerateConfig.getRegenerateHandler?.( finalMessage )?.();
			await mockAgentChatConfig?.onTaskUpdate?.( {
				id: 'task-regenerated',
				status: {
					state: 'completed',
					message: { messageId: 'agent-final', role: 'agent', kind: 'message', parts: [] },
				},
				text: 'No edit was made.',
				final: true,
				kind: 'status',
			} );
			resolveRegenerate();
			await regenerate;
		} );
		remountedView.rerender( chat() );

		const regeneratedMessages = mockAgentChat.mock.calls.at( -1 )![ 0 ].messages as Array< {
			actions?: Array< { id: string } >;
		} >;
		expect( regeneratedMessages[ 0 ].actions ).not.toEqual(
			expect.arrayContaining( [ expect.objectContaining( { id: 'checkpoint' } ) ] )
		);
	} );

	it( 'keeps a later-turn checkpoint action from a structured continuation result', async () => {
		const firstCheckpoint = createCheckpointMessage(
			'agent-first-structured-turn',
			'first-structured-checkpoint'
		);
		const laterUserMessage = {
			id: 'user-structured-continuation',
			role: 'user',
			content: [ { type: 'text', text: 'Make another edit' } ],
			timestamp: 2,
		};
		const initialMessages = [ userMessage, firstCheckpoint, laterUserMessage ];
		mockCheckpointActions();
		mockUseAgentChat.mockReturnValue( agentChatReturn( { messages: initialMessages } ) );
		const view = render( chat() );
		const checkpointResult = JSON.stringify( {
			tool_id: 'big_sky__apply_block_edits',
			tool_call_id: 'tool-call-structured-continuation',
			data: {
				result: {
					success: true,
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );

		await act( async () => {
			await mockAgentChatConfig?.onTaskUpdate?.( {
				id: 'task-structured-continuation',
				status: {
					state: 'working',
					message: {
						messageId: 'tool-result-structured-continuation',
						role: 'agent',
						kind: 'message',
						parts: [
							{
								type: 'data',
								data: {
									toolCallId: 'tool-call-structured-continuation',
									toolId: 'big_sky__apply_block_edits',
									result: {
										result: {
											success: true,
											outcome: 'updated',
											changeType: 'text-content',
										},
										returnToAgent: true,
										agentMessage: checkpointResult,
									},
								},
							},
						],
					},
				},
				text: '',
				final: false,
				kind: 'status',
			} );
			await mockAgentChatConfig?.onTaskUpdate?.( {
				id: 'task-structured-continuation',
				status: {
					state: 'completed',
					message: {
						messageId: 'agent-structured-final',
						role: 'agent',
						kind: 'message',
						parts: [],
					},
				},
				text: 'The paragraph has been updated again.',
				final: true,
				kind: 'status',
			} );
		} );

		const finalMessage = {
			id: 'agent-structured-final',
			role: 'agent' as const,
			content: [ { type: 'text' as const, text: 'The paragraph has been updated again.' } ],
			timestamp: 3,
			archived: false,
			showIcon: true,
		};
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ ...initialMessages, finalMessage ] } )
		);
		view.rerender( chat() );

		expect( getDisplayedCheckpointAction( finalMessage.id ) ).toEqual(
			expect.objectContaining( {
				label: 'Updated and Undo',
				componentProps: expect.objectContaining( { onUndo: expect.any( Function ) } ),
			} )
		);
	} );

	it( 'enables regenerate when a provider opts in', () => {
		render( chat( { capabilities: { supportsRegenerateAction: true } } ) );

		expect( mockUseRegenerateAction ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: true } )
		);
	} );

	it( 'disables stale regenerate actions on older agent messages before render', () => {
		const onRegenerate = jest.fn();
		// Mirror production: the getter enables regenerate only on the latest
		// agent message and disables it on older ones.
		mockUseRegenerateAction.mockReturnValue(
			( message: { role: string }, options: { isLatestAgentMessage: boolean } ) =>
				message.role === 'agent'
					? [
							{
								id: 'regenerate',
								label: 'Regenerate',
								onClick: onRegenerate,
								disabled: ! options.isLatestAgentMessage,
							},
					  ]
					: []
		);
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				messages: [
					{
						id: 'agent-1',
						role: 'agent',
						content: [ { type: 'text', text: 'First response' } ],
						timestamp: 1,
						archived: false,
						showIcon: true,
					},
					{
						id: 'agent-2',
						role: 'agent',
						content: [ { type: 'text', text: 'Second response' } ],
						timestamp: 2,
						archived: false,
						showIcon: true,
					},
				],
			} )
		);

		render( chat( { capabilities: { supportsRegenerateAction: true } } ) );

		const messages = mockAgentChat.mock.calls[ 0 ][ 0 ].messages as Array< {
			actions: Array< { id: string; disabled?: boolean } >;
		} >;

		expect( messages[ 0 ].actions[ 0 ] ).toEqual(
			expect.objectContaining( {
				id: 'regenerate',
				disabled: true,
			} )
		);
		expect( messages[ 1 ].actions[ 0 ] ).toEqual(
			expect.objectContaining( {
				id: 'regenerate',
				disabled: false,
			} )
		);
	} );

	it( 'tells the regenerate getter which message is latest and whether it is streaming', () => {
		const getRegenerateActions = jest.fn( () => [] );
		mockUseRegenerateAction.mockReturnValue( getRegenerateActions );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				messages: [
					{
						id: 'agent-1',
						role: 'agent',
						content: [ { type: 'text', text: 'First response' } ],
						timestamp: 1,
						archived: false,
						showIcon: true,
					},
					{
						id: 'agent-2',
						role: 'agent',
						content: [ { type: 'text', text: 'Streaming response' } ],
						timestamp: 2,
						archived: false,
						showIcon: true,
					},
				],
				isProcessing: true,
			} )
		);

		render( chat( { capabilities: { supportsRegenerateAction: true } } ) );

		expect( getRegenerateActions ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'agent-1' } ),
			{ isLatestAgentMessage: false, isStreaming: true }
		);
		expect( getRegenerateActions ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'agent-2' } ),
			{ isLatestAgentMessage: true, isStreaming: true }
		);
	} );

	it( 'does not stack retained show-component messages across repeated regenerations', () => {
		// The picker's identity — tool_call_id|type|summary — is stable across
		// regenerations even though each regenerated turn gets a fresh message id.
		// Steady state: the title picker is showing.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, showComponentMessage( 'agent-1' ) ] } )
		);
		const { rerender } = render( chat() );

		// Regenerate: the picker briefly disappears while the new turn streams.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage ], isProcessing: true } )
		);
		rerender( chat() );

		// New picker arrives — same identity, fresh agent message id.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, showComponentMessage( 'agent-2' ) ] } )
		);
		rerender( chat() );

		// Regenerate again: the picker disappears once more while streaming.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage ], isProcessing: true } )
		);
		rerender( chat() );

		expect( countShowComponentMessages() ).toBe( 1 );
	} );
	it( 'does not retain the live show-component message when the history is replaced', () => {
		// The same picker serializes differently live (no tool_call_id) and in
		// loaded history (with tool_call_id), so their identities never match.
		// Server hydration replaces the whole history with freshly-id'd messages;
		// that swap must not resurrect the live copy as a retained duplicate.
		const livePicker = showComponentMessage(
			'agent-live',
			JSON.stringify( {
				tool_id: 'big_sky__show_component',
				data: { type: 'titlePicker', summary: 'Optimize title' },
			} )
		);

		// Seeded from storage: the live-form picker is showing.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, livePicker ] } )
		);
		const { rerender } = render( chat() );

		// Server hydration replaces the whole history; every loaded message gets
		// a fresh id, including the echoed user message.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( {
				messages: [ { ...userMessage, id: 'user-loaded' }, showComponentMessage( 'agent-loaded' ) ],
			} )
		);
		rerender( chat() );

		expect( countShowComponentMessages() ).toBe( 1 );
	} );
	it( 'hides the previous component while a regeneration is processing', async () => {
		// Steady state: the picker is showing for the completed turn.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, showComponentMessage( 'agent-1' ) ] } )
		);
		const { rerender } = render( chat() );

		// Click regenerate: invoke the wrapped handler the component hands to the
		// regenerate-action hook.
		const config = mockUseRegenerateAction.mock.calls.at( -1 )![ 0 ] as {
			getRegenerateHandler?: ( message: unknown ) => ( () => Promise< void > ) | null | undefined;
		};
		const wrappedHandler = config.getRegenerateHandler?.( showComponentMessage( 'agent-1' ) );
		await act( async () => {
			await wrappedHandler?.();
		} );

		// agenttic rewinds the turn and streams the new response; the old picker is
		// gone from the live messages while it processes.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage ], isProcessing: true } )
		);
		rerender( chat() );

		expect( countShowComponentMessages() ).toBe( 0 );
	} );
	it( 'restores component retention after a regeneration finishes', async () => {
		// Steady state, then a full regeneration cycle.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, showComponentMessage( 'agent-1' ) ] } )
		);
		const { rerender } = render( chat() );

		const config = mockUseRegenerateAction.mock.calls.at( -1 )![ 0 ] as {
			getRegenerateHandler?: ( message: unknown ) => ( () => Promise< void > ) | null | undefined;
		};
		const wrappedHandler = config.getRegenerateHandler?.( showComponentMessage( 'agent-1' ) );
		await act( async () => {
			await wrappedHandler?.();
		} );

		// Regeneration streams, then settles with the fresh component.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage ], isProcessing: true } )
		);
		rerender( chat() );
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage, showComponentMessage( 'agent-2' ) ] } )
		);
		rerender( chat() );

		// A later turn (not a regeneration) transiently drops the component —
		// retention should cover it again now the regeneration has settled.
		mockUseAgentChat.mockReturnValue(
			agentChatReturn( { messages: [ userMessage ], isProcessing: true } )
		);
		rerender( chat() );

		expect( countShowComponentMessages() ).toBe( 1 );
	} );
} );
