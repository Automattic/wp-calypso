/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Suggestion } from '@automattic/agenttic-ui';
import type { ComponentProps } from 'react';

const mockUseAgentChat = jest.fn();
const mockUseRegenerateAction = jest.fn();
const mockUseConversation = jest.fn();
const mockUseImageUpload = jest.fn();
const mockIsReaderChatAgent = jest.fn();
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
		onSuggestionClick: ( suggestion: Suggestion | string ) => void;
		onSubmit: ( message: string ) => void;
		onAbort?: () => void;
		error?: string | null;
		inputValue?: string;
		onInputChange?: ( value: string ) => void;
		emptyViewSuggestions?: Suggestion[];
	} ) => (
		<>
			<button
				onClick={ () =>
					onSuggestionClick( {
						id: 'simplify-text',
						label: 'Simplify text',
						prompt: 'Simplify this text to make it easier to read',
					} )
				}
			>
				Click suggestion
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
					<li key={ suggestion.id }>{ suggestion.label }</li>
				) ) }
			</ul>
		</>
	)
);

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		getAgentManager: () => ( {
			updateSessionId: jest.fn(),
		} ),
		useAgentChat: () => mockUseAgentChat(),
	} ),
	{ virtual: true }
);
jest.mock( '@wordpress/data', () => ( {
	useSelect: () => undefined,
} ) );
jest.mock( '@wordpress/element', () => jest.requireActual( 'react' ) );
jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );
jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => jest.fn(),
} ) );
jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => ( {
		agentConfig: { agentId: 'wp-orchestrator' },
		getActiveSessionId: () => 'session-id',
		siteKey: 'site-1',
	} ),
} ) );
jest.mock( '../../hooks/custom-actions', () => ( {
	useRegisterCustomActions: () => {},
} ) );
jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: jest.fn(),
	recordAgentsManagerTracksEvent: jest.fn(),
} ) );
jest.mock( '../../hooks/use-conversation', () => () => mockUseConversation() );
jest.mock( '../../hooks/use-save-new-chat-route', () => () => {} );
jest.mock( '../../hooks/use-checkpoint-action', () => () => {} );
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
jest.mock( '../../hooks/use-zoom-action', () => () => {} );
jest.mock( '../../utils/agent-session', () => ( { markSessionUsed: jest.fn() } ) );
jest.mock( '../../utils/convert-tool-messages-to-components', () => ( {
	__esModule: true,
	default: ( { messages }: { messages: unknown[] } ) => messages,
} ) );
jest.mock( '../../utils/external-context', () => ( {
	consumeNextMessageExternalContextEntries: jest.fn(),
	removeExternalContextCard: jest.fn(),
	removeExternalContextEntry: jest.fn(),
} ) );
jest.mock( '../../utils/is-reader-chat-agent', () => ( {
	isReaderChatAgent: () => mockIsReaderChatAgent(),
} ) );
jest.mock( '../../utils/persist-last-activity', () => ( {
	persistLastActivity: jest.fn(),
} ) );
jest.mock( '../agent-chat', () => ( {
	__esModule: true,
	default: ( props: unknown ) => mockAgentChat( props as Parameters< typeof mockAgentChat >[ 0 ] ),
} ) );

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
		// Default getter: contributes no actions.
		mockUseRegenerateAction.mockReturnValue( () => [] );
		mockUseConversation.mockReturnValue( { isLoading: false } );
		mockUseAgentChat.mockReturnValue( agentChatReturn() );
		mockUseImageUpload.mockReturnValue( createImageUpload() );
		mockIsReaderChatAgent.mockReturnValue( false );
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
		} );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'chat_suggestion_click',
			expect.objectContaining( { suggestion_id: 'weekly-brief' } )
		);

		window.removeEventListener( 'big-sky-inline-suggestion-click', listener );
	} );

	it( 'passes the floating suggestion limit to external providers', () => {
		const useSuggestions = jest.fn( () => ( { suggestions: [] } ) );

		render( chat( { useSuggestions: useSuggestions } ) );

		expect( useSuggestions ).toHaveBeenCalledWith( 3, { suggestionsVisible: true } );
	} );

	it( 'does not limit external provider suggestions while docked', () => {
		const useSuggestions = jest.fn( () => ( { suggestions: [] } ) );

		render( chat( { isDocked: true, useSuggestions: useSuggestions } ) );

		expect( useSuggestions ).toHaveBeenCalledWith( undefined, { suggestionsVisible: true } );
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
	} );

	it( 'falls back to the static empty-view suggestions when the provider has none', () => {
		const staticDefaults: Suggestion[] = [
			{ id: 'getting-started', label: 'Getting started with WordPress', prompt: 'getting-started' },
		];
		const useSuggestions = jest.fn( () => ( { suggestions: [] } ) );

		render( chat( { emptyViewSuggestions: staticDefaults, useSuggestions: useSuggestions } ) );

		expect( screen.getByText( 'Getting started with WordPress' ) ).toBeTruthy();
	} );

	it( 'tracks chat_suggestions_rendered for the empty-view suggestions', () => {
		const staticDefaults: Suggestion[] = [
			{ id: 'getting-started', label: 'Getting started with WordPress', prompt: 'getting-started' },
		];

		render( chat( { emptyViewSuggestions: staticDefaults } ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_suggestions_rendered', {
			suggestions: '|getting-started|',
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
