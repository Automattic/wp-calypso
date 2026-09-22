/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockSetIsMinimized = jest.fn();
let mockIsInternalOnly = false;

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
	chevronLeft: 'chevronLeft',
	close: 'close',
	Icon: () => null,
	moreVertical: 'moreVertical',
} ) );
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setIsMinimized: mockSetIsMinimized } ),
} ) );
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'agents-manager' } ) );
jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => ( { isInternalOnly: mockIsInternalOnly } ),
} ) );
jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: jest.fn(),
	recordAgentsManagerTracksEvent: jest.fn(),
} ) );
jest.mock( '../../hooks/use-has-ai-chat-entry-button', () => ( {
	__esModule: true,
	default: () =>
		!! globalThis.document.getElementById( 'wp-admin-bar-agents-manager-ai-chat' ) ||
		!! globalThis.document.querySelector( '.masterbar__item-agents-manager-ai-chat' ),
} ) );
jest.mock( '../chat-header/style.scss', () => ( {} ) );

import ChatHeader from '../chat-header';

function installAdminBarTrigger() {
	const el = document.createElement( 'div' );
	el.id = 'wp-admin-bar-agents-manager-ai-chat';
	document.body.appendChild( el );
}

function installMasterbarTrigger() {
	const el = document.createElement( 'div' );
	el.className = 'masterbar__item-agents-manager-ai-chat';
	document.body.appendChild( el );
}

function renderChatHeader( title?: string, isDocked = false, onBack?: () => void ) {
	return render(
		<MemoryRouter>
			<ChatHeader
				onClose={ jest.fn() }
				options={ [] }
				title={ title }
				onBack={ onBack }
				isDocked={ isDocked }
			/>
		</MemoryRouter>
	);
}

describe( 'ChatHeader', () => {
	afterEach( () => {
		mockSetIsMinimized.mockClear();
		mockIsInternalOnly = false;
		document.getElementById( 'wp-admin-bar-agents-manager-ai-chat' )?.remove();
		delete ( globalThis as { agentsManagerData?: unknown } ).agentsManagerData;
		document.querySelector( '.masterbar__item-agents-manager-ai-chat' )?.remove();
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

	it( 'shows the internal-only pill with an explanatory title', () => {
		mockIsInternalOnly = true;

		renderChatHeader();

		expect( screen.getByText( 'A8C Only' ) ).toHaveAttribute(
			'title',
			'The current screen only has WordPress Agent enabled for internal use.'
		);
	} );

	it( 'places the internal-only pill after the back button and title', () => {
		mockIsInternalOnly = true;

		const { container } = renderChatHeader( 'Chat history', false, jest.fn() );
		const header = container.querySelector( '.agents-manager-chat-header' );

		expect( Array.from( header?.children ?? [] ).map( ( child ) => child.className ) ).toEqual( [
			'agents-manager-chat-header__back-btn',
			'agents-manager-chat-header__title',
			'agents-manager-chat-header__internal-only',
			'agents-manager-chat-header__actions',
		] );
	} );

	it( 'hides the internal-only pill on generally available screens', () => {
		renderChatHeader();

		expect( screen.queryByText( 'A8C Only' ) ).toBeNull();
	} );

	it( 'minimizes the chat when the Minimize button is clicked', () => {
		installAdminBarTrigger();

		renderChatHeader();
		fireEvent.click( screen.getByText( 'Minimize' ) );

		expect( mockSetIsMinimized ).toHaveBeenCalledWith( true );
	} );

	it( 'shows the Minimize button with the Calypso masterbar trigger', () => {
		installMasterbarTrigger();

		renderChatHeader();

		expect( screen.getByText( 'Minimize' ) ).toBeInTheDocument();
	} );

	it( 'hides the Minimize button without an entry-point trigger', () => {
		renderChatHeader();

		expect( screen.queryByText( 'Minimize' ) ).toBeNull();
	} );

	it( 'hides the Minimize button when docked', () => {
		installAdminBarTrigger();

		renderChatHeader( undefined, true );

		expect( screen.queryByText( 'Minimize' ) ).toBeNull();
	} );

	it( 'shows the Minimize button when floating even if the docked preference is set', () => {
		// `isDocked` is the effective state: a docked preference that can't
		// dock (e.g. a too-narrow viewport) arrives here as `false`, so minimize shows.
		installAdminBarTrigger();

		renderChatHeader( undefined, false );

		expect( screen.getByText( 'Minimize' ) ).toBeInTheDocument();
	} );
} );
