/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { useGetHistoryChats } from '../../hooks';
import HelpCenterRecentConversations from '../help-center-recent-conversations';

vi.mock( 'react-router-dom', () => ( {
	useNavigate: () => vi.fn(),
} ) );

vi.mock( '@automattic/components/src/summary-button', () => ( {
	__esModule: true,
	default: ( { title, description }: { title: string; description: React.ReactNode } ) => (
		<button>
			<span>{ title }</span>
			{ description }
		</button>
	),
} ) );

vi.mock( '../../hooks', () => ( {
	useGetHistoryChats: vi.fn(),
} ) );

vi.mock( '../../hooks/use-help-center-tracks-event', () => ( {
	useHelpCenterTracksEvent: () => vi.fn(),
} ) );

vi.mock( '../../contexts/HelpCenterContext', () => ( {
	useHelpCenterContext: () => ( { sectionName: 'test' } ),
} ) );

vi.mock( '../utils', async () => ( {
	getChatLinkFromConversation: () => '/odie',
	getLastMessage: ( await vi.importActual< typeof import( '../utils' ) >( '../utils' ) )
		.getLastMessage,
} ) );

const mockUseGetHistoryChats = useGetHistoryChats as Mock;

const odieConversation = {
	id: '123',
	createdAt: 1756000000,
	messages: [ { received: 1756000000, role: 'user', text: 'How do I connect a custom domain?' } ],
};

const zendeskConversation = {
	id: 'zd-1',
	lastUpdatedAt: 1756000000,
	messages: [
		{ id: 'zd-message-1', received: 1756000000, role: 'user', text: 'Cancelling my plan' },
	],
};

describe( 'HelpCenterRecentConversations', () => {
	afterEach( () => {
		mockUseGetHistoryChats.mockReset();
	} );

	it( 'labels an AI conversation as a support assistant chat', () => {
		mockUseGetHistoryChats.mockReturnValue( { recentConversations: [ odieConversation ] } );

		render( <HelpCenterRecentConversations /> );

		expect( screen.getByText( 'Support assistant chat' ) ).toBeVisible();
		expect( screen.queryByText( 'Happiness chat' ) ).not.toBeInTheDocument();
	} );

	it( 'labels a Zendesk conversation as a Happiness chat', () => {
		mockUseGetHistoryChats.mockReturnValue( { recentConversations: [ zendeskConversation ] } );

		render( <HelpCenterRecentConversations /> );

		expect( screen.getByText( 'Happiness chat' ) ).toBeVisible();
	} );

	it( 'renders nothing when there are no conversations', () => {
		mockUseGetHistoryChats.mockReturnValue( { recentConversations: [] } );

		const { container } = render( <HelpCenterRecentConversations /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
