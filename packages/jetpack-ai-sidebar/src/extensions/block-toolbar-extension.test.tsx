/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { withJetpackAiToolbarButton } from './block-toolbar-extension';

jest.mock( '@automattic/components/src/logos/big-sky-logo', () => ( {
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
	}: {
		icon?: React.ReactNode;
		label: string;
		onClick: () => void;
	} ) => (
		<button aria-label={ label } data-testid="toolbar-button" onClick={ onClick }>
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

declare global {
	interface Window {
		__agentsManagerActions?: {
			isReady?: boolean;
			setChatOpen?: ( isOpen: boolean ) => void;
			setChatDocked?: ( isDocked: boolean ) => void;
			setChatCompactMode?: ( isCompact: boolean ) => void;
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
	installPreview( { blockTransformations: true, blockToolbarButton: true } );
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
			expect( screen.getByRole( 'button', { name: 'Ask Jetpack AI' } ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'big-sky-logo' ) ).toBeInTheDocument();
		}
	);

	it( 'renders the toolbar button when block transformations and the toolbar button are enabled', () => {
		enableToolbarButton();

		renderToolbar();

		expect( screen.getByRole( 'button', { name: 'Ask Jetpack AI' } ) ).toBeInTheDocument();
	} );

	it( 'hides the toolbar button when preview data is unavailable', () => {
		renderToolbar();

		expect( screen.queryByRole( 'button', { name: 'Ask Jetpack AI' } ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'block-controls' ) ).not.toBeInTheDocument();
	} );

	it.each( [
		[ 'preview is disabled', { blockTransformations: true, blockToolbarButton: true }, false ],
		[ 'only editorial review is enabled', { aiEditorialReview: true }, true ],
		[ 'block transformations are missing', { blockToolbarButton: true }, true ],
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
			expect( screen.queryByRole( 'button', { name: 'Ask Jetpack AI' } ) ).not.toBeInTheDocument();
			expect( screen.queryByTestId( 'block-controls' ) ).not.toBeInTheDocument();
		}
	);

	it( 'opens Agents Manager in compact mode when actions are ready', () => {
		const setChatOpen = jest.fn();
		const setChatDocked = jest.fn();
		const setChatCompactMode = jest.fn();
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
			setChatDocked,
			setChatCompactMode,
		};

		enableToolbarButton();
		renderToolbar();
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask Jetpack AI' } ) );

		expect( setChatDocked ).toHaveBeenCalledWith( false );
		expect( setChatCompactMode ).toHaveBeenCalledWith( true );
		expect( setChatOpen ).toHaveBeenCalledWith( false );
	} );

	it( 'falls back to opening Agents Manager when compact mode is unavailable', () => {
		const setChatOpen = jest.fn();
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
		};

		enableToolbarButton();
		renderToolbar();
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask Jetpack AI' } ) );

		expect( setChatOpen ).toHaveBeenCalledWith( true );
	} );

	it( 'opens Agents Manager once the ready event fires', () => {
		const setChatOpen = jest.fn();
		const setChatDocked = jest.fn();
		const setChatCompactMode = jest.fn();
		const addEventListenerSpy = jest.spyOn( window, 'addEventListener' );

		enableToolbarButton();
		renderToolbar();
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask Jetpack AI' } ) );

		expect( addEventListenerSpy ).toHaveBeenCalledWith(
			'agents-manager-ready',
			expect.any( Function ),
			{ once: true }
		);
		expect( setChatOpen ).not.toHaveBeenCalled();

		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
			setChatDocked,
			setChatCompactMode,
		};
		window.dispatchEvent( new CustomEvent( 'agents-manager-ready' ) );

		expect( setChatDocked ).toHaveBeenCalledWith( false );
		expect( setChatCompactMode ).toHaveBeenCalledWith( true );
		expect( setChatOpen ).toHaveBeenCalledWith( false );
	} );

	it( 'does not submit or prefill chat when clicked', () => {
		const setChatOpen = jest.fn();
		const setChatDocked = jest.fn();
		const setChatCompactMode = jest.fn();
		const submitChatMessage = jest.fn();
		const setChatInput = jest.fn();
		window.__agentsManagerActions = {
			isReady: true,
			setChatOpen,
			setChatDocked,
			setChatCompactMode,
			submitChatMessage,
			setChatInput,
		};

		enableToolbarButton();
		renderToolbar();
		fireEvent.click( screen.getByRole( 'button', { name: 'Ask Jetpack AI' } ) );

		expect( setChatOpen ).toHaveBeenCalledWith( false );
		expect( setChatDocked ).toHaveBeenCalledWith( false );
		expect( setChatCompactMode ).toHaveBeenCalledWith( true );
		expect( submitChatMessage ).not.toHaveBeenCalled();
		expect( setChatInput ).not.toHaveBeenCalled();
	} );
} );
