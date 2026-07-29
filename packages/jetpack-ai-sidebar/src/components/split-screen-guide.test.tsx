/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { trackSplitScreenGuideClick, trackSplitScreenGuideRendered } from '../utils/tracking';
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

jest.mock( '../utils/tracking', () => ( {
	trackSplitScreenGuideClick: jest.fn(),
	trackSplitScreenGuideRendered: jest.fn(),
} ) );

const mockTrackSplitScreenGuideClick = trackSplitScreenGuideClick as jest.MockedFunction<
	typeof trackSplitScreenGuideClick
>;
const mockTrackSplitScreenGuideRendered = trackSplitScreenGuideRendered as jest.MockedFunction<
	typeof trackSplitScreenGuideRendered
>;

describe( 'SplitScreenGuide', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockAgentsManagerState = {
			isDocked: true,
			isSplitScreen: false,
		};
	} );

	it( 'renders a chat-native suggestion for a current result in the docked sidebar', () => {
		render( <SplitScreenGuide componentType="proofread" /> );

		expect(
			screen.getByText(
				'For a better read of this feedback, switch to split screen. Use the menu at the top of this chat, or this button:'
			)
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Switch to split screen mode' } ) ).toBeVisible();
		expect( screen.queryByText( 'Show' ) ).not.toBeInTheDocument();
		expect( mockTrackSplitScreenGuideRendered ).toHaveBeenCalledWith( {
			componentType: 'proofread',
		} );
	} );

	it( 'switches directly to split screen', () => {
		render( <SplitScreenGuide componentType="post-feedback" /> );

		fireEvent.click(
			screen.getByRole( 'button', {
				name: 'Switch to split screen mode',
			} )
		);

		expect( mockTrackSplitScreenGuideClick ).toHaveBeenCalledWith( {
			componentType: 'post-feedback',
		} );
		expect( mockSetIsSplitScreen ).toHaveBeenCalledWith( true );
	} );

	it( 'reappears after returning from split screen to the docked sidebar', () => {
		const { rerender } = render( <SplitScreenGuide componentType="proofread" /> );
		expect( mockTrackSplitScreenGuideRendered ).toHaveBeenCalledTimes( 1 );

		rerender( <SplitScreenGuide componentType="proofread" /> );
		expect( mockTrackSplitScreenGuideRendered ).toHaveBeenCalledTimes( 1 );

		mockAgentsManagerState.isSplitScreen = true;
		rerender( <SplitScreenGuide componentType="proofread" /> );
		expect(
			screen.queryByRole( 'button', {
				name: 'Switch to split screen mode',
			} )
		).not.toBeInTheDocument();

		mockAgentsManagerState.isSplitScreen = false;
		rerender( <SplitScreenGuide componentType="proofread" /> );
		expect(
			screen.getByRole( 'button', {
				name: 'Switch to split screen mode',
			} )
		).toBeVisible();
		expect( mockTrackSplitScreenGuideRendered ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'tracks when a guide first becomes visible after mounting in split screen', () => {
		mockAgentsManagerState.isSplitScreen = true;
		const { rerender } = render( <SplitScreenGuide componentType="proofread" /> );
		expect( mockTrackSplitScreenGuideRendered ).not.toHaveBeenCalled();

		mockAgentsManagerState.isSplitScreen = false;
		rerender( <SplitScreenGuide componentType="proofread" /> );

		expect( mockTrackSplitScreenGuideRendered ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'tracks a new guide component instance', () => {
		const firstGuide = render( <SplitScreenGuide componentType="proofread" /> );
		expect( mockTrackSplitScreenGuideRendered ).toHaveBeenCalledTimes( 1 );

		firstGuide.unmount();
		render( <SplitScreenGuide componentType="proofread" /> );

		expect( mockTrackSplitScreenGuideRendered ).toHaveBeenCalledTimes( 2 );
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

		render( <SplitScreenGuide componentType="proofread" { ...props } /> );

		expect(
			screen.queryByRole( 'button', {
				name: 'Switch to split screen mode',
			} )
		).not.toBeInTheDocument();
		expect( mockTrackSplitScreenGuideRendered ).not.toHaveBeenCalled();
	} );
} );
