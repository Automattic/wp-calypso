/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Suggestion } from '@automattic/agenttic-ui';
import type { ReactNode, Ref } from 'react';

const mockSetFloatingPosition = jest.fn();

jest.mock(
	'@automattic/agenttic-ui',
	() => {
		const React = jest.requireActual< typeof import('react') >( 'react' );

		function MockContainer( {
			children,
			emptyView,
		}: {
			children: ReactNode;
			emptyView: ReactNode;
		} ) {
			return (
				<div>
					{ emptyView }
					{ children }
				</div>
			);
		}

		const MockConversationView = React.forwardRef(
			( { children }: { children: ReactNode }, ref: Ref< HTMLDivElement > ) => (
				<div ref={ ref }>{ children }</div>
			)
		);
		MockConversationView.displayName = 'MockConversationView';

		function MockFooter( { children }: { children: ReactNode } ) {
			return <div>{ children }</div>;
		}

		function MockEmptyView( {
			suggestions = [],
			onSuggestionClick,
		}: {
			suggestions?: Suggestion[];
			onSuggestionClick?: (
				selectedSuggestion: Suggestion,
				availableSuggestions: Suggestion[]
			) => void;
		} ) {
			return (
				<div>
					{ suggestions.map( ( suggestion ) => (
						<button
							key={ suggestion.id }
							onClick={ () => onSuggestionClick?.( suggestion, suggestions ) }
						>
							{ suggestion.label }
						</button>
					) ) }
				</div>
			);
		}

		function MockMessageRenderer( { children }: { children: ReactNode } ) {
			return <>{ children }</>;
		}

		const MockImageUploader = React.forwardRef( () => null );
		MockImageUploader.displayName = 'MockImageUploader';

		return {
			AgentUI: {
				Container: MockContainer,
				ConversationView: MockConversationView,
				Messages: () => null,
				Footer: MockFooter,
				Suggestions: () => null,
				Notice: () => null,
				Input: () => null,
			},
			createMessageRenderer: () => MockMessageRenderer,
			EmptyView: MockEmptyView,
			ImageUploader: MockImageUploader,
		};
	},
	{ virtual: true }
);

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setFloatingPosition: mockSetFloatingPosition,
	} ),
	useSelect: ( selectFn: ( select: () => { getAgentsManagerState: () => object } ) => unknown ) =>
		selectFn( () => ( {
			getAgentsManagerState: () => ( { floatingPosition: undefined } ),
		} ) ),
} ) );

jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );
jest.mock( '../../stores', () => ( {
	AGENTS_MANAGER_STORE: 'automattic/agents-manager',
} ) );
jest.mock( '../chat-header', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../context-cards', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../feedback-input', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../icons', () => ( {
	AI: () => null,
} ) );
jest.mock( '../selected-block', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../../utils/is-plugin-compass-agent', () => ( {
	isPluginCompassHost: () => false,
} ) );
jest.mock( '../../utils/is-reader-chat-agent', () => ( {
	isReaderChatHost: () => false,
} ) );

import AgentChat from '../agent-chat';

describe( 'AgentChat', () => {
	it( 'forwards empty view suggestion clicks to the shared suggestion handler', async () => {
		const user = userEvent.setup();
		const suggestion = {
			id: 'check-grammar',
			label: 'Check grammar',
			prompt: 'Check the grammar and spelling of this text',
		};
		const onSuggestionClick = jest.fn();

		render(
			<AgentChat
				messages={ [] }
				suggestions={ [] }
				emptyViewSuggestions={ [ suggestion ] }
				error={ null }
				chatHeaderOptions={ [] }
				isProcessing={ false }
				isLoadingConversation={ false }
				isDocked={ false }
				isOpen
				onSubmit={ jest.fn() }
				onAbort={ jest.fn() }
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
				onSuggestionClick={ onSuggestionClick }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Check grammar' } ) );

		expect( onSuggestionClick ).toHaveBeenCalledWith( suggestion, [ suggestion ] );
	} );
} );
