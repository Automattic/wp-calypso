/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import SplitScreenGuide from './split-screen-guide';

const mockSetIsSplitScreen = jest.fn();
let mockAgentsManagerState: {
	isDocked?: boolean;
	isSplitScreen?: boolean;
};

jest.mock( '@wordpress/components', () => ( {
	Button: ( { children, onClick }: { children: React.ReactNode; onClick: () => void } ) => (
		<button type="button" onClick={ onClick }>
			{ children }
		</button>
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
	} );

	it( 'renders a chat-native suggestion for a current result in the docked sidebar', () => {
		render( <SplitScreenGuide /> );

		expect(
			screen.getByText(
				'For a better read of this feedback, switch to split screen. Use the menu at the top of this chat, or this button:'
			)
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Switch to split screen mode' } ) ).toBeVisible();
		expect( screen.queryByText( 'Show' ) ).not.toBeInTheDocument();
	} );

	it( 'switches directly to split screen', () => {
		render( <SplitScreenGuide /> );

		fireEvent.click(
			screen.getByRole( 'button', {
				name: 'Switch to split screen mode',
			} )
		);

		expect( mockSetIsSplitScreen ).toHaveBeenCalledWith( true );
	} );

	it( 'reappears after returning from split screen to the docked sidebar', () => {
		const { rerender } = render( <SplitScreenGuide /> );

		mockAgentsManagerState.isSplitScreen = true;
		rerender( <SplitScreenGuide /> );
		expect(
			screen.queryByRole( 'button', {
				name: 'Switch to split screen mode',
			} )
		).not.toBeInTheDocument();

		mockAgentsManagerState.isSplitScreen = false;
		rerender( <SplitScreenGuide /> );
		expect(
			screen.getByRole( 'button', {
				name: 'Switch to split screen mode',
			} )
		).toBeVisible();
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

		expect(
			screen.queryByRole( 'button', {
				name: 'Switch to split screen mode',
			} )
		).not.toBeInTheDocument();
	} );
} );
