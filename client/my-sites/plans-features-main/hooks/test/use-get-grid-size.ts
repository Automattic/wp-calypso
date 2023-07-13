import { useBreakpoint } from '@automattic/viewport-react';
import { renderHook } from '@testing-library/react-hooks';
import { useSelector } from 'react-redux';
import { useGetGridSize } from '../use-get-grid-size';

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: jest.fn(),
} ) );

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSidebarIsCollapsed: jest.fn(),
} ) );

describe( 'useGetGridSize', () => {
	describe( 'calls to useBreakpoint', () => {
		beforeEach( () => {
			useBreakpoint.mockReset();
		} );

		test( 'should pass correct breakpoints to useBreapoint when isInSignup is false and sidebar is not collapsed', () => {
			useSelector.mockReturnValueOnce( false );
			renderHook( () => useGetGridSize( { isInSignup: false } ) );
			expect( useBreakpoint ).toHaveBeenNthCalledWith( 1, '>1472px' );
			expect( useBreakpoint ).toHaveBeenNthCalledWith( 2, '>1052px' );
		} );

		test( 'should pass correct breakpoints to useBreapoint when isInSignup is true and sidebar is not collapsed', () => {
			useSelector.mockReturnValueOnce( false );
			renderHook( () => useGetGridSize( { isInSignup: true } ) );
			expect( useBreakpoint ).toHaveBeenNthCalledWith( 1, '>1200px' );
			expect( useBreakpoint ).toHaveBeenNthCalledWith( 2, '>780px' );
		} );

		test( 'should pass correct breakpoints to useBreapoint when isInSignup is false and sidebar is collapsed', () => {
			useSelector.mockReturnValueOnce( true );
			renderHook( () => useGetGridSize( { isInSignup: false } ) );
			expect( useBreakpoint ).toHaveBeenNthCalledWith( 1, '>1200px' );
			expect( useBreakpoint ).toHaveBeenNthCalledWith( 2, '>780px' );
		} );

		test( 'should pass correct breakpoints to useBreapoint when isInSignup is true and sidebar is collapsed', () => {
			useSelector.mockReturnValueOnce( true );
			renderHook( () => useGetGridSize( { isInSignup: true } ) );
			expect( useBreakpoint ).toHaveBeenNthCalledWith( 1, '>1200px' );
			expect( useBreakpoint ).toHaveBeenNthCalledWith( 2, '>780px' );
		} );
	} );

	describe( 'return values', () => {
		beforeEach( () => {
			useBreakpoint.mockReset();
		} );

		test( 'returns "large" when large and medium breakpoints are hit', () => {
			useBreakpoint.mockReturnValueOnce( true ).mockReturnValueOnce( false );
			const { result } = renderHook( () => useGetGridSize( { isInSignup: false } ) );
			expect( result.current ).toBe( 'large' );
		} );

		test( 'returns "medium" when medium breakpoints is hit', () => {
			useBreakpoint.mockReturnValueOnce( false ).mockReturnValueOnce( true );
			const { result } = renderHook( () => useGetGridSize( { isInSignup: false } ) );
			expect( result.current ).toBe( 'medium' );
		} );

		test( 'returns "small" when both large and medium breakpoints are not hit', () => {
			useBreakpoint.mockReturnValueOnce( false ).mockReturnValueOnce( false );
			const { result } = renderHook( () => useGetGridSize( { isInSignup: false } ) );
			expect( result.current ).toBe( 'small' );
		} );
	} );
} );
