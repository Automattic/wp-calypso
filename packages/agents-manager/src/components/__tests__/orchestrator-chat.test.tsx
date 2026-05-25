/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen } from '@testing-library/react';
import type { Suggestion } from '@automattic/agenttic-ui';

const mockUseAgentChat = jest.fn();

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
	default: ( { onSuggestionClick }: { onSuggestionClick: ( suggestion: Suggestion ) => void } ) => (
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
	),
} ) );

import OrchestratorChat from '../orchestrator-chat';

describe( 'OrchestratorChat', () => {
	beforeEach( () => {
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
} );
