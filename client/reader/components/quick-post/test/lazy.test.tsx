/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { LazyQuickPost } from '../lazy';

let mockInView = false;
const mockRef = jest.fn();
const useInViewCalls: Array< { skip?: boolean } > = [];

jest.mock( 'react-intersection-observer', () => ( {
	useInView: ( opts: { skip?: boolean } ) => {
		useInViewCalls.push( opts );
		return { ref: mockRef, inView: mockInView };
	},
} ) );

// AsyncLoad lazily imports the heavy editor chunk; stand in for the resolved
// editor so we can assert when (and only when) it gets mounted.
jest.mock( 'calypso/components/async-load', () => ( {
	__esModule: true,
	default: () => <div data-testid="quick-post-editor" />,
} ) );

jest.mock( '../skeleton', () => ( {
	QuickPostSkeleton: () => <div data-testid="quick-post-skeleton" />,
} ) );

describe( 'LazyQuickPost', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		mockInView = false;
		useInViewCalls.length = 0;
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'shows the skeleton and keeps the observer skipped until the initial layout settles', () => {
		render( <LazyQuickPost /> );

		expect( screen.getByTestId( 'quick-post-skeleton' ) ).toBeVisible();
		expect( screen.queryByTestId( 'quick-post-editor' ) ).not.toBeInTheDocument();
		expect( useInViewCalls[ useInViewCalls.length - 1 ].skip ).toBe( true );
	} );

	it( 'starts observing once the initial layout has settled', () => {
		render( <LazyQuickPost /> );

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( useInViewCalls[ useInViewCalls.length - 1 ].skip ).toBe( false );
	} );

	it( 'mounts the editor only once the settled slot is in view', () => {
		render( <LazyQuickPost /> );

		// Slot is on screen, but the editor should wait for the layout to settle.
		mockInView = true;
		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( screen.getByTestId( 'quick-post-editor' ) ).toBeVisible();
		expect( screen.queryByTestId( 'quick-post-skeleton' ) ).not.toBeInTheDocument();
	} );
} );
