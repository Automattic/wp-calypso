/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Suggestion } from '@automattic/agenttic-ui';

const mockUseAgentChat = jest.fn();
const mockUseRegenerateAction = jest.fn();
const mockAgentChat = jest.fn(
	( {
		onSuggestionClick,
		onSubmit,
		emptyViewSuggestions = [],
	}: {
		messages?: unknown[];
		onSuggestionClick: ( suggestion: Suggestion | string ) => void;
		onSubmit: ( message: string ) => void;
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
			<button onClick={ () => onSubmit( 'Describe these images' ) }>Submit with images</button>
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
jest.mock( '../../hooks/use-conversation', () => () => ( { isLoading: false } ) );
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
	isReaderChatAgent: () => false,
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

describe( 'OrchestratorChat', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseAgentChat.mockReturnValue( {
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
			getRegenerateHandler: jest.fn(),
			progressMessage: null,
		} );
	} );

	it( 'dispatches the inline suggestion event when an Agenttic suggestion is clicked', () => {
		const listener = jest.fn();
		window.addEventListener( 'big-sky-inline-suggestion-click', listener );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [] }
				isDocked={ false }
				isOpen
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
				chatHeaderOptions={ [] }
				markdownComponents={ {} }
				markdownExtensions={ {} }
				isCompactMode={ false }
				onHasMessagesChange={ jest.fn() }
			/>
		);

		fireEvent.click( screen.getByText( 'Click suggestion' ) );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( ( listener.mock.calls[ 0 ][ 0 ] as CustomEvent ).detail ).toEqual( {
			value: 'Simplify this text to make it easier to read',
		} );

		window.removeEventListener( 'big-sky-inline-suggestion-click', listener );
	} );

	it( 'dispatches the inline suggestion event when Agenttic passes a prompt string', () => {
		const listener = jest.fn();
		window.addEventListener( 'big-sky-inline-suggestion-click', listener );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [] }
				isDocked={ false }
				isOpen
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
				chatHeaderOptions={ [] }
				markdownComponents={ {} }
				markdownExtensions={ {} }
				isCompactMode={ false }
				onHasMessagesChange={ jest.fn() }
			/>
		);

		fireEvent.click( screen.getByText( 'Click string suggestion' ) );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( ( listener.mock.calls[ 0 ][ 0 ] as CustomEvent ).detail ).toEqual( {
			value: 'Check the grammar and spelling of this text',
		} );

		window.removeEventListener( 'big-sky-inline-suggestion-click', listener );
	} );

	it( 'passes the floating suggestion limit to external providers', () => {
		const useSuggestions = jest.fn( () => ( { suggestions: [] } ) );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [] }
				isDocked={ false }
				isOpen
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

		expect( useSuggestions ).toHaveBeenCalledWith( 3, { suggestionsVisible: true } );
	} );

	it( 'does not limit external provider suggestions while docked', () => {
		const useSuggestions = jest.fn( () => ( { suggestions: [] } ) );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [] }
				isDocked
				isOpen
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
		mockUseAgentChat.mockReturnValue( {
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
			progressMessage: null,
		} );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ staticDefaults }
				isDocked={ false }
				isOpen
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

		expect( screen.getByText( 'What needs my attention today?' ) ).toBeTruthy();
		expect( screen.queryByText( 'Getting started with WordPress' ) ).toBeNull();
	} );

	it( 'falls back to the static empty-view suggestions when the provider has none', () => {
		const staticDefaults: Suggestion[] = [
			{ id: 'getting-started', label: 'Getting started with WordPress', prompt: 'getting-started' },
		];
		const useSuggestions = jest.fn( () => ( { suggestions: [] } ) );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ staticDefaults }
				isDocked={ false }
				isOpen
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

		expect( screen.getByText( 'Getting started with WordPress' ) ).toBeTruthy();
	} );

	it( 'fires file_upload_success after images upload on send, with the uploaded media count', async () => {
		const uploadImagesToWordPress = jest.fn().mockResolvedValue( [
			{ id: 1, url: 'a' },
			{ id: 2, url: 'b' },
		] );
		const useImageUpload = () => ( {
			pendingImages: [ { id: 'p1' }, { id: 'p2' } ],
			uploadingImages: [],
			isUploadingImages: false,
			handleFilesSelected: jest.fn(),
			handleRemoveImage: jest.fn(),
			uploadImagesToWordPress,
		} );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [] }
				isDocked={ false }
				isOpen
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
				chatHeaderOptions={ [] }
				markdownComponents={ {} }
				markdownExtensions={ {} }
				isCompactMode={ false }
				useImageUpload={ useImageUpload as never }
				onHasMessagesChange={ jest.fn() }
			/>
		);

		fireEvent.click( screen.getByText( 'Submit with images' ) );

		await waitFor( () => {
			expect( uploadImagesToWordPress ).toHaveBeenCalled();
			expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'file_upload_success', {
				count: 2,
			} );
		} );
	} );

	it( 'keeps regenerate disabled unless a provider opts in', () => {
		render(
			<OrchestratorChat
				emptyViewSuggestions={ [] }
				isDocked={ false }
				isOpen
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
				chatHeaderOptions={ [] }
				markdownComponents={ {} }
				markdownExtensions={ {} }
				isCompactMode={ false }
				onHasMessagesChange={ jest.fn() }
			/>
		);

		expect( mockUseRegenerateAction ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: false } )
		);
	} );

	it( 'enables regenerate when a provider opts in', () => {
		render(
			<OrchestratorChat
				emptyViewSuggestions={ [] }
				isDocked={ false }
				isOpen
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
				chatHeaderOptions={ [] }
				markdownComponents={ {} }
				markdownExtensions={ {} }
				isCompactMode={ false }
				capabilities={ { supportsRegenerateAction: true } }
				onHasMessagesChange={ jest.fn() }
			/>
		);

		expect( mockUseRegenerateAction ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: true } )
		);
	} );

	it( 'disables stale regenerate actions on older agent messages before render', () => {
		const onRegenerate = jest.fn();
		mockUseAgentChat.mockReturnValue( {
			addMessage: jest.fn(),
			messages: [
				{
					id: 'agent-1',
					role: 'agent',
					content: [ { type: 'text', text: 'First response' } ],
					timestamp: 1,
					archived: false,
					showIcon: true,
					actions: [
						{
							id: 'regenerate',
							label: 'Regenerate',
							onClick: onRegenerate,
							disabled: false,
						},
					],
				},
				{
					id: 'agent-2',
					role: 'agent',
					content: [ { type: 'text', text: 'Second response' } ],
					timestamp: 2,
					archived: false,
					showIcon: true,
					actions: [
						{
							id: 'regenerate',
							label: 'Regenerate',
							onClick: onRegenerate,
							disabled: false,
						},
					],
				},
			],
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
			getRegenerateHandler: jest.fn(),
			progressMessage: null,
		} );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [] }
				isDocked={ false }
				isOpen
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
				chatHeaderOptions={ [] }
				markdownComponents={ {} }
				markdownExtensions={ {} }
				isCompactMode={ false }
				capabilities={ { supportsRegenerateAction: true } }
				onHasMessagesChange={ jest.fn() }
			/>
		);

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
} );
