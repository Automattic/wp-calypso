/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useGetHistoryChats } from '../../hooks';
import HelpCenterRecentConversations from '../help-center-recent-conversations';

jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => jest.fn(),
} ) );

jest.mock( '@automattic/components/src/summary-button', () => ( {
	__esModule: true,
	default: ( { title, description }: { title: string; description: React.ReactNode } ) => (
		<button>
			<span>{ title }</span>
			{ description }
		</button>
	),
} ) );

jest.mock( '../../hooks', () => ( {
	useGetHistoryChats: jest.fn(),
} ) );

jest.mock( '../../hooks/use-help-center-tracks-event', () => ( {
	useHelpCenterTracksEvent: () => jest.fn(),
} ) );

jest.mock( '../../contexts/HelpCenterContext', () => ( {
	useHelpCenterContext: () => ( { sectionName: 'test' } ),
} ) );

jest.mock( '../utils', () => ( {
	getChatLinkFromConversation: () => '/odie',
	getLastMessage: jest.requireActual( '../utils' ).getLastMessage,
} ) );

const mockUseGetHistoryChats = useGetHistoryChats as jest.Mock;

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
