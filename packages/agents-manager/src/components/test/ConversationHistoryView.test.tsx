/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversationHistoryView from '../conversation-history-view';

const mockUseConversationList = jest.fn();

jest.mock( '../../hooks/use-conversation-list', () => ( {
	__esModule: true,
	default: () => mockUseConversationList(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		onClick,
		className,
	}: {
		children: unknown;
		onClick?: () => void;
		className?: string;
	} ) => (
		<button type="button" onClick={ onClick } className={ className }>
			{ children }
		</button>
	),
	SearchControl: ( {
		value,
		onChange,
		placeholder,
	}: {
		value: string;
		onChange: ( value: string ) => void;
		placeholder?: string;
	} ) => (
		<input
			type="search"
			aria-label={ placeholder ?? 'Search' }
			placeholder={ placeholder }
			value={ value }
			onChange={ ( e ) => onChange( e.target.value ) }
		/>
	),
} ) );

jest.mock( '../conversation-list-item', () => ( {
	__esModule: true,
	default: ( {
		conversation,
		onClick,
	}: {
		conversation: { first_message?: { content?: string } };
		onClick: ( conversation: unknown ) => void;
	} ) => (
		<button type="button" onClick={ () => onClick( conversation ) }>
			{ conversation.first_message?.content ?? 'Untitled conversation' }
		</button>
	),
} ) );

jest.mock( '../conversation-list-skeleton', () => ( {
	__esModule: true,
	default: () => <div>Loading</div>,
} ) );

describe( 'ConversationHistoryView', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseConversationList.mockReturnValue( {
			conversations: [
				{
					session_id: 'session-1',
					first_message: {
						content: 'How do I configure DNS records?',
						created_at: '2026-03-04 11:00:00',
					},
				},
				{
					session_id: 'session-2',
					first_message: {
						content: 'Set up WooCommerce shipping zones',
						created_at: '2026-03-03 10:00:00',
					},
				},
			],
			isLoading: false,
			isError: false,
		} );
	} );

	it( 'shows all conversations when search is empty', () => {
		render(
			<ConversationHistoryView onSelectConversation={ jest.fn() } onNewChat={ jest.fn() } />
		);

		expect( screen.getByText( 'How do I configure DNS records?' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Set up WooCommerce shipping zones' ) ).toBeInTheDocument();
	} );

	it( 'filters conversations by search text (case-insensitive)', async () => {
		const user = userEvent.setup();
		render(
			<ConversationHistoryView onSelectConversation={ jest.fn() } onNewChat={ jest.fn() } />
		);

		await user.type( screen.getByRole( 'searchbox', { name: /search past chats/i } ), 'Woo' );

		expect( screen.queryByText( 'How do I configure DNS records?' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Set up WooCommerce shipping zones' ) ).toBeInTheDocument();
	} );

	it( 'shows no-matching-conversations state when search has no results', async () => {
		const user = userEvent.setup();
		render(
			<ConversationHistoryView onSelectConversation={ jest.fn() } onNewChat={ jest.fn() } />
		);

		await user.type(
			screen.getByRole( 'searchbox', { name: /search past chats/i } ),
			'nonexistent query'
		);

		expect( screen.getByText( 'No matching conversations' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Try a different search term' ) ).toBeInTheDocument();
	} );
} );
