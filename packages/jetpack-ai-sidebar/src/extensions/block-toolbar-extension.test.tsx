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

// Reactive pressed state comes from the shared Agents Manager store. `undefined`
// models the store not being registered yet.
let mockChatState: { isOpen?: boolean; isMinimized?: boolean } | undefined;
let mockCurrentPostType: string | undefined;
let mockCurrentPostId: string | number | undefined;
const mockEditorStoreListeners = new Set< () => void >();

jest.mock( '@wordpress/data', () => ( {
	select: ( store: string ) =>
		store === 'core/editor'
			? {
					getCurrentPostId: () => mockCurrentPostId,
					getCurrentPostType: () => mockCurrentPostType,
			  }
			: undefined,
	subscribe: ( listener: () => void ) => {
		mockEditorStoreListeners.add( listener );
		return () => mockEditorStoreListeners.delete( listener );
	},
	useSelect: ( mapSelect: ( select: ( store: string ) => unknown ) => unknown ) =>
		mapSelect( ( store: string ) => {
			if ( store === 'automattic/agents-manager' && mockChatState ) {
				return { getAgentsManagerState: () => mockChatState };
			}
			if ( store === 'core/editor' ) {
				return {
					getCurrentPostId: () => mockCurrentPostId,
					getCurrentPostType: () => mockCurrentPostType,
				};
			}
			return undefined;
		} ),
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
const nativeReplaceState = window.history.replaceState.bind( window.history );

function installPreview(
	features: Record< string, boolean > = {},
	enabled = true,
	isWpcomPlatform?: boolean
) {
	( globalThis as Record< string, unknown > ).agentsManagerData = {
		isWpcomPlatform,
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
		mockChatState = undefined;
		mockCurrentPostType = undefined;
		mockCurrentPostId = undefined;
		mockEditorStoreListeners.clear();
		document.body.className = '';
		nativeReplaceState( {}, '', '/' );
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

	it( 'renders the toolbar button on a connected self-hosted page editor', () => {
		mockCurrentPostType = 'page';
		mockCurrentPostId = 42;
		document.body.className = 'post-php post-type-page';
		nativeReplaceState( {}, '', '/wp-admin/post.php?post=42&action=edit' );
		installPreview( { blockToolbarButton: true }, true, false );

		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toBeInTheDocument();
	} );

	it.each( [
		'post',
		'wp_template',
		'wp_template_part',
		'wp_block',
		'wp_navigation',
		'wp_global_styles',
		'product',
		undefined,
	] )( 'hides the connected self-hosted toolbar button for the %s entity', ( postType ) => {
		mockCurrentPostType = postType;
		document.body.className = 'post-php';
		nativeReplaceState( {}, '', '/wp-admin/post.php?post=42&action=edit' );
		installPreview( { blockToolbarButton: true }, true, false );

		renderToolbar();

		expect( screen.queryByRole( 'button', { name: 'Ask AI' } ) ).not.toBeInTheDocument();
	} );

	it( 'does not mistake the Styles page preview for a page edit', () => {
		mockCurrentPostType = 'page';
		document.body.className = 'site-editor-php';
		nativeReplaceState( {}, '', '/wp-admin/site-editor.php?p=%2Fstyles&canvas=edit' );
		installPreview( { blockToolbarButton: true }, true, false );

		renderToolbar();

		expect( screen.queryByRole( 'button', { name: 'Ask AI' } ) ).not.toBeInTheDocument();
	} );

	it( 'removes and restores the toolbar button during Site Editor navigation', () => {
		mockCurrentPostType = 'page';
		mockCurrentPostId = 42;
		document.body.className = 'site-editor-php';
		nativeReplaceState( {}, '', '/wp-admin/site-editor.php?canvas=edit&p=%2Fpage%2F42' );
		installPreview( { blockToolbarButton: true }, true, false );

		renderToolbar();
		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toBeInTheDocument();

		act( () => {
			window.history.pushState( {}, '', '/wp-admin/site-editor.php?p=%2Fstyles&canvas=edit' );
		} );
		expect( screen.queryByRole( 'button', { name: 'Ask AI' } ) ).not.toBeInTheDocument();

		act( () => {
			window.history.replaceState( {}, '', '/wp-admin/site-editor.php?canvas=edit&p=%2Fpage%2F42' );
		} );
		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toBeInTheDocument();
	} );

	it( 'hides the toolbar button when preview data is unavailable', () => {
		renderToolbar();

		expect( screen.queryByRole( 'button', { name: 'Ask AI' } ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'block-controls' ) ).not.toBeInTheDocument();
	} );

	it.each( [
		[ 'preview is disabled', { blockTransformations: true, blockToolbarButton: true }, false ],
		[ 'only AI Editorial Review is enabled', { aiEditorialReview: true }, true ],
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

	it( 'applies the queued click as a toggle when the ready event fires', () => {
		const setChatOpen = jest.fn();

		enableToolbarButton();
		renderToolbar();
		// Click before the actions are ready: the toggle is queued.
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask AI' } ) );
		expect( setChatOpen ).not.toHaveBeenCalled();

		// If the chat is already visible by the time the actions load, applying the
		// queued click closes it rather than blindly re-opening.
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
			isChatVisible: () => true,
		};
		window.dispatchEvent( new CustomEvent( 'agents-manager-ready' ) );

		expect( setChatOpen ).toHaveBeenCalledWith( false );
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

	it( 'renders the button as pressed when the chat is open in the store', () => {
		mockChatState = { isOpen: true, isMinimized: false };

		enableToolbarButton();
		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	} );

	it( 'renders the button as not pressed when the chat is closed', () => {
		mockChatState = { isOpen: false, isMinimized: false };

		enableToolbarButton();
		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	} );

	it( 'renders the button as not pressed when the chat is minimized', () => {
		mockChatState = { isOpen: true, isMinimized: true };

		enableToolbarButton();
		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	} );

	it( 'renders the button as not pressed when the store is not registered yet', () => {
		mockChatState = undefined;

		enableToolbarButton();
		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	} );
} );
