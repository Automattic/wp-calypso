/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { withJetpackAiToolbarButton } from './block-toolbar-extension';

jest.mock( '@automattic/components', () => ( {
	BigSkyLogo: {
		CentralLogo: () => <svg data-testid="big-sky-logo" />,
	},
} ) );

jest.mock( '@wordpress/block-editor', () => ( {
	BlockControls: ( { children, group }: { children: React.ReactNode; group?: string } ) => (
		<div data-group={ group } data-testid="block-controls">
			{ children }
		</div>
	),
} ) );

jest.mock( '@wordpress/components', () => ( {
	ToolbarButton: ( {
		icon,
		label,
		onClick,
		isPressed,
	}: {
		icon?: React.ReactNode;
		label: string;
		onClick: () => void;
		isPressed?: boolean;
	} ) => (
		<button
			aria-label={ label }
			aria-pressed={ isPressed }
			data-testid="toolbar-button"
			onClick={ onClick }
		>
			{ icon }
		</button>
	),
	ToolbarGroup: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock( '@wordpress/compose', () => ( {
	createHigherOrderComponent: ( fn: ( component: React.ComponentType ) => React.ComponentType ) =>
		fn,
} ) );

jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

declare global {
	interface Window {
		__agentsManagerActions?: {
			isReady?: boolean;
			setChatOpen?: ( isOpen: boolean ) => void;
			isChatVisible?: () => boolean;
			submitChatMessage?: ( message?: string ) => Promise< void >;
			setChatInput?: ( value: string ) => void;
		};
	}
}

const BlockEdit = ( { name }: { name: string } ) => <div data-testid="block-edit">{ name }</div>;

function installPreview( features: Record< string, boolean > = {}, enabled = true ) {
	( globalThis as Record< string, unknown > ).agentsManagerData = {
		jetpackAiSidebar: {
			enabled,
			features,
		},
	};
}

function enableToolbarButton() {
	installPreview( { blockToolbarButton: true } );
}

function renderToolbar( name = 'core/paragraph' ) {
	const Component = withJetpackAiToolbarButton( BlockEdit );
	return render( <Component name={ name } /> );
}

describe( 'withJetpackAiToolbarButton', () => {
	beforeEach( () => {
		delete ( globalThis as Record< string, unknown > ).agentsManagerData;
		delete window.__agentsManagerActions;
		jest.restoreAllMocks();
	} );

	it( 'returns a component compatible with class extends', () => {
		const Wrapped = withJetpackAiToolbarButton( BlockEdit );
		const ConstructableWrapped = Wrapped as new ( props: { name: string } ) => React.Component< {
			name: string;
		} >;

		expect( () => {
			class TestExtend extends ConstructableWrapped {}
			return TestExtend;
		} ).not.toThrow();
	} );

	it.each( [ 'core/image', 'core/paragraph', 'core/heading', 'core/list', 'core/quote' ] )(
		'renders the Jetpack AI toolbar button for %s',
		( name ) => {
			enableToolbarButton();

			renderToolbar( name );

			expect( screen.getByTestId( 'block-edit' ) ).toHaveTextContent( name );
			expect( screen.getByTestId( 'block-controls' ) ).toHaveAttribute( 'data-group', 'default' );
			expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'big-sky-logo' ) ).toBeInTheDocument();
		}
	);

	it( 'renders the toolbar button from its own flag, independent of block transformations', () => {
		installPreview( { blockToolbarButton: true, blockTransformations: false } );

		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toBeInTheDocument();
	} );

	it( 'hides the toolbar button when preview data is unavailable', () => {
		renderToolbar();

		expect( screen.queryByRole( 'button', { name: 'Ask AI' } ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'block-controls' ) ).not.toBeInTheDocument();
	} );

	it.each( [
		[ 'preview is disabled', { blockTransformations: true, blockToolbarButton: true }, false ],
		[ 'only editorial review is enabled', { aiEditorialReview: true }, true ],
		[ 'toolbar button is missing', { blockTransformations: true }, true ],
		[
			'toolbar button is disabled',
			{ blockTransformations: true, blockToolbarButton: false },
			true,
		],
	] )(
		'hides the toolbar button when %s',
		( _label, features: Record< string, boolean >, enabled: boolean ) => {
			installPreview( features, enabled );

			renderToolbar();

			expect( screen.getByTestId( 'block-edit' ) ).toHaveTextContent( 'core/paragraph' );
			expect( screen.queryByRole( 'button', { name: 'Ask AI' } ) ).not.toBeInTheDocument();
			expect( screen.queryByTestId( 'block-controls' ) ).not.toBeInTheDocument();
		}
	);

	it( 'opens Agents Manager when the chat is not visible and actions are ready', () => {
		const setChatOpen = jest.fn();
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
			isChatVisible: () => false,
		};

		enableToolbarButton();
		renderToolbar();
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask AI' } ) );

		// The toolbar entry only opens the chat — it does not reshape its layout.
		expect( setChatOpen ).toHaveBeenCalledWith( true );
	} );

	it( 'closes Agents Manager when the chat is already visible', () => {
		const setChatOpen = jest.fn();
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
			isChatVisible: () => true,
		};

		enableToolbarButton();
		renderToolbar();
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask AI' } ) );

		// Clicking the toolbar entry while the chat is visible toggles it closed.
		expect( setChatOpen ).toHaveBeenCalledWith( false );
	} );

	it( 'opens Agents Manager when actions are ready but expose no visibility state', () => {
		const setChatOpen = jest.fn();
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
		};

		enableToolbarButton();
		renderToolbar();
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask AI' } ) );

		// Without an `isChatVisible` action, treat the chat as not visible and open it.
		expect( setChatOpen ).toHaveBeenCalledWith( true );
	} );

	it( 'opens Agents Manager once the ready event fires', () => {
		const setChatOpen = jest.fn();
		const addEventListenerSpy = jest.spyOn( window, 'addEventListener' );

		enableToolbarButton();
		renderToolbar();
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask AI' } ) );

		expect( addEventListenerSpy ).toHaveBeenCalledWith(
			'agents-manager-ready',
			expect.any( Function ),
			{ once: true }
		);
		expect( setChatOpen ).not.toHaveBeenCalled();

		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
		};
		window.dispatchEvent( new CustomEvent( 'agents-manager-ready' ) );

		expect( setChatOpen ).toHaveBeenCalledWith( true );
	} );

	it( 'does not submit or prefill chat when clicked', () => {
		const setChatOpen = jest.fn();
		const submitChatMessage = jest.fn();
		const setChatInput = jest.fn();
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
			submitChatMessage,
			setChatInput,
		};

		enableToolbarButton();
		renderToolbar();
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask AI' } ) );

		expect( setChatOpen ).toHaveBeenCalledWith( true );
		expect( submitChatMessage ).not.toHaveBeenCalled();
		expect( setChatInput ).not.toHaveBeenCalled();
	} );

	it( 'renders the button as pressed when the chat is already visible on mount', () => {
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen: jest.fn(),
			isChatVisible: () => true,
		};

		enableToolbarButton();
		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	} );

	it( 'renders the button as not pressed when the chat is not visible', () => {
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen: jest.fn(),
			isChatVisible: () => false,
		};

		enableToolbarButton();
		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	} );

	it( 'updates the pressed state from the chat visibility event detail', () => {
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen: jest.fn(),
			isChatVisible: () => false,
		};

		enableToolbarButton();
		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);

		// Agents Manager opens the chat elsewhere (e.g. the masterbar) and
		// broadcasts the new value in the event detail.
		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'agents-manager-chat-visibility-changed', {
					detail: { isVisible: true },
				} )
			);
		} );

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	} );

	it( 'un-presses when the chat is closed and re-presses when re-opened', () => {
		// Regression: the button must track every toggle, not just the state at
		// load. It reads each new value from the event detail rather than
		// re-reading the actions API, which is refreshed a beat later.
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen: jest.fn(),
			isChatVisible: () => true,
		};

		enableToolbarButton();
		renderToolbar();

		const button = screen.getByRole( 'button', { name: 'Ask AI' } );
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );

		// Close the chat.
		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'agents-manager-chat-visibility-changed', {
					detail: { isVisible: false },
				} )
			);
		} );
		expect( button ).toHaveAttribute( 'aria-pressed', 'false' );

		// Re-open it.
		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'agents-manager-chat-visibility-changed', {
					detail: { isVisible: true },
				} )
			);
		} );
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'reflects the visible chat once Agents Manager becomes ready', () => {
		enableToolbarButton();
		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);

		// Agents Manager loads after the button, with the chat already visible.
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen: jest.fn(),
			isChatVisible: () => true,
		};
		act( () => {
			window.dispatchEvent( new CustomEvent( 'agents-manager-ready' ) );
		} );

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	} );

	it( 'shares a single window subscription across every block on the page', () => {
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen: jest.fn(),
			isChatVisible: () => false,
		};
		const addEventListenerSpy = jest.spyOn( window, 'addEventListener' );

		enableToolbarButton();
		const Component = withJetpackAiToolbarButton( BlockEdit );
		render(
			<>
				<Component name="core/paragraph" />
				<Component name="core/heading" />
				<Component name="core/image" />
			</>
		);

		// The toolbar HOC wraps every block, but only one shared listener is added
		// for the visibility event regardless of how many blocks are on the page.
		const visibilityListeners = addEventListenerSpy.mock.calls.filter(
			( [ type ] ) => type === 'agents-manager-chat-visibility-changed'
		);
		expect( visibilityListeners ).toHaveLength( 1 );

		// A single broadcast updates every block's button.
		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'agents-manager-chat-visibility-changed', {
					detail: { isVisible: true },
				} )
			);
		} );

		const buttons = screen.getAllByRole( 'button', { name: 'Ask AI' } );
		expect( buttons ).toHaveLength( 3 );
		buttons.forEach( ( button ) => expect( button ).toHaveAttribute( 'aria-pressed', 'true' ) );
	} );

	it( 'removes its window listeners once the last block unmounts', () => {
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen: jest.fn(),
			isChatVisible: () => false,
		};
		const removeEventListenerSpy = jest.spyOn( window, 'removeEventListener' );

		enableToolbarButton();
		const { unmount } = renderToolbar();
		unmount();

		expect( removeEventListenerSpy ).toHaveBeenCalledWith(
			'agents-manager-chat-visibility-changed',
			expect.any( Function )
		);
		expect( removeEventListenerSpy ).toHaveBeenCalledWith(
			'agents-manager-ready',
			expect.any( Function )
		);
	} );
} );
