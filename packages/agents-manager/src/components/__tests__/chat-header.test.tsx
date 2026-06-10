/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockIsDocked = false;
const mockSetIsMinimized = jest.fn();
const mockHasAdminBarTrigger = jest.fn();

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		className,
		label,
		onClick,
	}: {
		children?: React.ReactNode;
		className?: string;
		label?: string;
		onClick?: () => void;
	} ) => (
		<button className={ className } onClick={ onClick }>
			{ label }
			{ children }
		</button>
	),
	DropdownMenu: ( { label }: { label?: string } ) => <button>{ label }</button>,
} ) );
jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );
jest.mock( '@wordpress/icons', () => ( {
	backup: 'backup',
	chevronLeft: 'chevronLeft',
	close: 'close',
	Icon: () => null,
	lineSolid: 'lineSolid',
	moreVertical: 'moreVertical',
} ) );
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setIsMinimized: mockSetIsMinimized } ),
	useSelect: ( mapSelect: ( select: () => unknown ) => unknown ) =>
		mapSelect( () => ( { getIsDocked: () => mockIsDocked } ) ),
} ) );
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'agents-manager' } ) );
jest.mock( '../../hooks/use-admin-bar-integration', () => ( {
	hasAdminBarTrigger: () => mockHasAdminBarTrigger(),
} ) );
jest.mock( '../chat-header/style.scss', () => ( {} ) );

import ChatHeader from '../chat-header';

// `isReaderChatHost()` reads the agent ID from this global.
function installReaderChatHost() {
	( globalThis as { agentsManagerData?: { agentId?: string } } ).agentsManagerData = {
		agentId: 'reader-chat',
	};
}

function renderChatHeader( title?: string ) {
	return render(
		<MemoryRouter>
			<ChatHeader onClose={ jest.fn() } options={ [] } title={ title } />
		</MemoryRouter>
	);
}

describe( 'ChatHeader', () => {
	beforeEach( () => {
		mockHasAdminBarTrigger.mockReturnValue( false );
	} );

	afterEach( () => {
		mockIsDocked = false;
		mockSetIsMinimized.mockClear();
		delete ( globalThis as { agentsManagerData?: unknown } ).agentsManagerData;
	} );

	it( 'renders the title with a matching title attribute so the full text shows on hover when truncated', () => {
		const title = 'A very long support guides title';
		renderChatHeader( title );

		expect( screen.getByText( title ) ).toHaveAttribute( 'title', title );
	} );

	it( 'does not render the title element when no title is provided', () => {
		const { container } = renderChatHeader();

		expect( container.querySelector( '.agents-manager-chat-header__title' ) ).toBeNull();
	} );

	it( 'shows the history button by default', () => {
		renderChatHeader();

		expect( screen.getByText( 'View history' ) ).toBeInTheDocument();
	} );

	it( 'hides the history button on reader-chat hosts', () => {
		installReaderChatHost();

		renderChatHeader();

		expect( screen.queryByText( 'View history' ) ).toBeNull();
	} );

	it( 'minimizes the chat when the Minimize button is clicked', () => {
		mockHasAdminBarTrigger.mockReturnValue( true );

		renderChatHeader();
		fireEvent.click( screen.getByText( 'Minimize' ) );

		expect( mockSetIsMinimized ).toHaveBeenCalledWith( true );
	} );

	it( 'hides the Minimize button without the WP admin bar trigger', () => {
		renderChatHeader();

		expect( screen.queryByText( 'Minimize' ) ).toBeNull();
	} );

	it( 'hides the Minimize button when docked', () => {
		mockHasAdminBarTrigger.mockReturnValue( true );
		mockIsDocked = true;

		renderChatHeader();

		expect( screen.queryByText( 'Minimize' ) ).toBeNull();
	} );
} );
