/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import useHasAiChatEntryButton from '../../hooks/use-has-ai-chat-entry-button';
import AdminBarAiChatEntryLabel from '../ai-chat-entry-label/admin-bar';

jest.mock( '../../hooks/use-has-ai-chat-entry-button', () => ( {
	__esModule: true,
	default: jest.fn( () => true ),
	ADMIN_BAR_AI_CHAT_BUTTON_ID: 'wp-admin-bar-agents-manager-ai-chat',
} ) );
jest.mock( '../ai-chat-entry-label', () => ( {
	__esModule: true,
	default: () => <span>Agent</span>,
} ) );

const mockUseHasAiChatEntryButton = useHasAiChatEntryButton as jest.Mock;

const adminBarButton = document.createElement( 'li' );
adminBarButton.id = 'wp-admin-bar-agents-manager-ai-chat';
adminBarButton.innerHTML = '<div class="ab-item"></div>';

describe( 'AdminBarAiChatEntryLabel', () => {
	afterEach( () => adminBarButton.remove() );

	it( 'portals the label into the admin bar button', () => {
		document.body.append( adminBarButton );

		render( <AdminBarAiChatEntryLabel /> );

		expect( adminBarButton.querySelector( '.ab-item' ) ).toContainElement(
			screen.getByText( 'Agent' )
		);
	} );

	it( 'renders nothing without the admin bar button', () => {
		const { container } = render( <AdminBarAiChatEntryLabel /> );

		expect( container ).toBeEmptyDOMElement();
		expect( screen.queryByText( 'Agent' ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing while the admin bar button does not count as an entry', () => {
		mockUseHasAiChatEntryButton.mockReturnValueOnce( false );
		document.body.append( adminBarButton );

		render( <AdminBarAiChatEntryLabel /> );

		expect( screen.queryByText( 'Agent' ) ).not.toBeInTheDocument();
	} );
} );
