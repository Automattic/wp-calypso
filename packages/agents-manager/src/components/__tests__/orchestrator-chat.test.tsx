/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen } from '@testing-library/react';
import type { Suggestion } from '@automattic/agenttic-ui';

const mockUseAgentChat = jest.fn();
let mockSelectedBlock: unknown;

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
	useSelect: ( mapSelect: ( select: ( storeName?: string ) => unknown ) => unknown ) =>
		mapSelect( ( storeName?: string ) => {
			if ( storeName === 'core/block-editor' ) {
				return {
					getSelectedBlock: () => mockSelectedBlock,
				};
			}
			return {
				getCurrentPostId: () => undefined,
				getCurrentPostType: () => undefined,
			};
		} ),
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
jest.mock( '../../hooks/use-conversation', () => () => ( { isLoading: false } ) );
jest.mock( '../../hooks/use-save-new-chat-route', () => () => {} );
jest.mock( '../../hooks/use-checkpoint-action', () => () => {} );
jest.mock( '../../hooks/use-feedback-action', () => () => ( {
	showFeedbackInput: false,
	submitFeedbackText: jest.fn(),
	resetFeedback: jest.fn(),
} ) );
jest.mock( '../../hooks/use-copy-action', () => () => {} );
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
	default: ( {
		onSuggestionClick,
		suggestions,
		emptyViewSuggestions,
	}: {
		onSuggestionClick: ( suggestion: Suggestion | string ) => void;
		suggestions: Suggestion[];
		emptyViewSuggestions: Suggestion[];
	} ) => (
		<>
			<div data-testid="input-suggestions">
				{ suggestions.map( ( suggestion ) => (
					<span key={ suggestion.id }>{ suggestion.label }</span>
				) ) }
			</div>
			<div data-testid="empty-view-suggestions">
				{ emptyViewSuggestions.map( ( suggestion ) => (
					<span key={ suggestion.id }>{ suggestion.label }</span>
				) ) }
			</div>
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
		</>
	),
} ) );

import OrchestratorChat from '../orchestrator-chat';

describe( 'OrchestratorChat', () => {
	beforeEach( () => {
		mockSelectedBlock = undefined;
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

	it( 'treats docked chat as visible even when the floating open state is false', () => {
		const dynamicSuggestion = {
			id: 'optimize-title',
			label: 'Optimize Title',
			prompt: 'Optimize the title of this post',
		};
		const useSuggestions = jest.fn( ( _maxSuggestions, options ) => ( {
			suggestions: options?.suggestionsVisible ? [ dynamicSuggestion ] : [],
		} ) );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [] }
				isDocked
				isOpen={ false }
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
		expect( screen.getByTestId( 'empty-view-suggestions' ).textContent ).toContain(
			'Optimize Title'
		);
	} );

	it( 'passes live external provider suggestions when Agenttic suggestions are empty', () => {
		const dynamicSuggestion = {
			id: 'change-colors',
			label: 'Change colors',
			prompt: 'Show me color palettes for my site',
		};
		const useSuggestions = jest.fn( () => ( { suggestions: [ dynamicSuggestion ] } ) );

		mockUseAgentChat.mockReturnValue( {
			addMessage: jest.fn(),
			messages: [
				{
					id: 'tool-result',
					role: 'agent',
					content: [ { type: 'text', text: 'Here are some options.' } ],
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
			progressMessage: null,
		} );

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

		expect( screen.getByTestId( 'input-suggestions' ).textContent ).toContain( 'Change colors' );
	} );

	it( 'composes dynamic and empty-view provider suggestions while the chat is empty', () => {
		const optimizeTitleSuggestion = {
			id: 'optimize-title',
			label: 'Optimize Title',
			prompt: 'Optimize the title of this post',
		};
		const bigSkySuggestion = {
			id: 'customize-colors',
			label: 'Change colors',
			prompt: 'Show me color palettes for my site',
		};
		const registerSuggestions = jest.fn();
		const useSuggestions = jest.fn( () => ( { suggestions: [ optimizeTitleSuggestion ] } ) );

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
			registerSuggestions,
			registerMessageActions: jest.fn(),
			progressMessage: null,
		} );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [ bigSkySuggestion ] }
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

		expect( screen.getByTestId( 'input-suggestions' ).textContent ).not.toContain(
			'Optimize Title'
		);
		expect( screen.getByTestId( 'input-suggestions' ).textContent ).not.toContain(
			'Change colors'
		);
		expect( screen.getByTestId( 'empty-view-suggestions' ).textContent ).toContain(
			'Optimize Title'
		);
		expect( screen.getByTestId( 'empty-view-suggestions' ).textContent ).toContain(
			'Change colors'
		);
		expect( registerSuggestions ).toHaveBeenCalledWith( [
			optimizeTitleSuggestion,
			bigSkySuggestion,
		] );
	} );

	it( 'does not append empty-view suggestions when a block is selected', () => {
		const textBlockSuggestion = {
			id: 'translate',
			label: 'Translate content',
			prompt: 'Translate this to:',
		};
		const bigSkySuggestion = {
			id: 'customize-colors',
			label: 'Change colors',
			prompt: 'Show me color palettes for my site',
		};
		const registerSuggestions = jest.fn();
		const useSuggestions = jest.fn( () => ( { suggestions: [ textBlockSuggestion ] } ) );
		mockSelectedBlock = { clientId: 'block-1', name: 'core/paragraph' };

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
			registerSuggestions,
			registerMessageActions: jest.fn(),
			progressMessage: null,
		} );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [ bigSkySuggestion ] }
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

		expect( screen.getByTestId( 'empty-view-suggestions' ).textContent ).toContain(
			'Translate content'
		);
		expect( screen.getByTestId( 'empty-view-suggestions' ).textContent ).not.toContain(
			'Change colors'
		);
		expect( registerSuggestions ).toHaveBeenCalledWith( [ textBlockSuggestion ] );
	} );

	it( 'ignores stale Agenttic suggestions when selected-block provider suggestions are available', () => {
		const textBlockSuggestion = {
			id: 'translate',
			label: 'Translate content',
			prompt: 'Translate this to:',
		};
		const staleImageSuggestion = {
			id: 'generate-image',
			label: 'Generate image',
			prompt: 'Generate an image of:',
		};
		const globalSuggestion = {
			id: 'customize-colors',
			label: 'Change colors',
			prompt: 'Show me color palettes for my site',
		};
		const registerSuggestions = jest.fn();
		const useSuggestions = jest.fn( () => ( { suggestions: [ textBlockSuggestion ] } ) );
		mockSelectedBlock = { clientId: 'block-1', name: 'core/paragraph' };

		mockUseAgentChat.mockReturnValue( {
			addMessage: jest.fn(),
			messages: [],
			suggestions: [ staleImageSuggestion ],
			isProcessing: false,
			error: null,
			loadMessages: jest.fn(),
			onSubmit: jest.fn(),
			abortCurrentRequest: jest.fn(),
			clearSuggestions: jest.fn(),
			registerSuggestions,
			registerMessageActions: jest.fn(),
			progressMessage: null,
		} );

		render(
			<OrchestratorChat
				emptyViewSuggestions={ [ globalSuggestion ] }
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

		expect( screen.getByTestId( 'empty-view-suggestions' ).textContent ).toContain(
			'Translate content'
		);
		expect( screen.getByTestId( 'empty-view-suggestions' ).textContent ).not.toContain(
			'Generate image'
		);
		expect( screen.getByTestId( 'empty-view-suggestions' ).textContent ).not.toContain(
			'Change colors'
		);
		expect( registerSuggestions ).toHaveBeenCalledWith( [ textBlockSuggestion ] );
	} );
} );
