/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import SplitScreenGuide from './split-screen-guide';

const DISMISSED_STORAGE_KEY = 'jetpack-ai-sidebar-split-screen-guide-dismissed';
const mockSetIsSplitScreen = jest.fn();
const mockOpenChatMoreOptions = jest.fn();
let mockAgentsManagerState: {
	isDocked?: boolean;
	isSplitScreen?: boolean;
};

jest.mock( '@wordpress/components', () => ( {
	Notice: ( {
		actions,
		children,
		onRemove,
	}: {
		actions: Array< { label: string; onClick: () => void } >;
		children: React.ReactNode;
		onRemove: () => void;
	} ) => (
		<div role="note">
			<div>{ children }</div>
			{ actions.map( ( action ) => (
				<button key={ action.label } onClick={ action.onClick }>
					{ action.label }
				</button>
			) ) }
			<button aria-label="Dismiss" onClick={ onRemove } />
		</div>
	),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: () => object ) => unknown ) =>
		callback( () => ( {
			getAgentsManagerState: () => mockAgentsManagerState,
		} ) ),
	useDispatch: () => ( {
		setIsSplitScreen: mockSetIsSplitScreen,
	} ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

describe( 'SplitScreenGuide', () => {
	beforeEach( () => {
		mockAgentsManagerState = {
			isDocked: true,
			isSplitScreen: false,
		};
		mockSetIsSplitScreen.mockClear();
		mockOpenChatMoreOptions.mockClear();
		localStorage.clear();
		(
			window as Window & {
				__agentsManagerActions?: { openChatMoreOptions?: () => void };
			}
		 ).__agentsManagerActions = {
			openChatMoreOptions: mockOpenChatMoreOptions,
		};
	} );

	afterEach( () => {
		delete (
			window as Window & {
				__agentsManagerActions?: { openChatMoreOptions?: () => void };
			}
		 ).__agentsManagerActions;
	} );

	it( 'renders a native tip for a current result in the docked sidebar', () => {
		render( <SplitScreenGuide /> );

		expect( screen.getByRole( 'note' ) ).toHaveTextContent(
			'Tip: Review this feedback in split screen for better experience'
		);
		expect( screen.getByRole( 'button', { name: 'Switch' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Show' } ) ).toBeVisible();
	} );

	it( 'switches directly to split screen and remembers the dismissal', () => {
		render( <SplitScreenGuide /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Switch' } ) );

		expect( mockSetIsSplitScreen ).toHaveBeenCalledWith( true );
		expect( localStorage.getItem( DISMISSED_STORAGE_KEY ) ).toBe( '1' );
		expect( screen.queryByRole( 'note' ) ).not.toBeInTheDocument();
	} );

	it( 'opens the existing More Options menu and remembers the dismissal', () => {
		render( <SplitScreenGuide /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Show' } ) );

		expect( mockOpenChatMoreOptions ).toHaveBeenCalledTimes( 1 );
		expect( localStorage.getItem( DISMISSED_STORAGE_KEY ) ).toBe( '1' );
		expect( screen.queryByRole( 'note' ) ).not.toBeInTheDocument();
	} );

	it( 'persists an explicit dismissal', () => {
		render( <SplitScreenGuide /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( localStorage.getItem( DISMISSED_STORAGE_KEY ) ).toBe( '1' );
		expect( screen.queryByRole( 'note' ) ).not.toBeInTheDocument();
	} );

	it.each( [
		{
			name: 'the result is stale',
			props: { isStale: true },
			state: { isDocked: true, isSplitScreen: false },
		},
		{
			name: 'the sidebar is not docked',
			props: {},
			state: { isDocked: false, isSplitScreen: false },
		},
		{
			name: 'split screen is already active',
			props: {},
			state: { isDocked: true, isSplitScreen: true },
		},
	] )( 'does not render when $name', ( { props, state } ) => {
		mockAgentsManagerState = state;

		render( <SplitScreenGuide { ...props } /> );

		expect( screen.queryByRole( 'note' ) ).not.toBeInTheDocument();
	} );

	it( 'does not render after it has been dismissed', () => {
		localStorage.setItem( DISMISSED_STORAGE_KEY, '1' );

		render( <SplitScreenGuide /> );

		expect( screen.queryByRole( 'note' ) ).not.toBeInTheDocument();
	} );
} );
