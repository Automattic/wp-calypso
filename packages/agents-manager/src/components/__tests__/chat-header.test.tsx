/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

type AgentsManagerTestGlobal = typeof globalThis & {
	agentsManagerData?: {
		jetpackAiSidebarPreview?: {
			enabled: boolean;
			features?: Record< string, boolean >;
		};
	};
};

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
	moreVertical: 'moreVertical',
} ) );
jest.mock( '../chat-header/style.scss', () => ( {} ) );

import ChatHeader from '../chat-header';

function installJetpackAiSidebarPreviewData( features: Record< string, boolean > ) {
	( globalThis as AgentsManagerTestGlobal ).agentsManagerData = {
		jetpackAiSidebarPreview: {
			enabled: true,
			features,
		},
	};
}

function renderChatHeader() {
	return render(
		<MemoryRouter>
			<ChatHeader onClose={ jest.fn() } options={ [] } />
		</MemoryRouter>
	);
}

describe( 'ChatHeader', () => {
	afterEach( () => {
		delete ( globalThis as AgentsManagerTestGlobal ).agentsManagerData;
	} );

	it( 'shows the history button by default', () => {
		renderChatHeader();

		expect( screen.getByText( 'View history' ) ).toBeInTheDocument();
	} );

	it( 'hides the history button when Jetpack AI Sidebar Preview disables chat history', () => {
		installJetpackAiSidebarPreviewData( { chatHistory: false } );

		renderChatHeader();

		expect( screen.queryByText( 'View history' ) ).toBeNull();
	} );

	it( 'hides the history button when Jetpack AI Sidebar Preview omits chat history', () => {
		installJetpackAiSidebarPreviewData( {} );

		renderChatHeader();

		expect( screen.queryByText( 'View history' ) ).toBeNull();
	} );
} );
