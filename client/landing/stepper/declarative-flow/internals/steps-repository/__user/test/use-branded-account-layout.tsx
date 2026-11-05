/**
 * @jest-environment jsdom
 */

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: jest.fn(),
} ) );

import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import useBrandedAccountLayout from '../use-branded-account-layout';

const mockUseViewportMatch = useViewportMatch as unknown as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

describe( 'useBrandedAccountLayout', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		mockUseQuery.mockReturnValue( new URLSearchParams() );
		mockUseViewportMatch.mockReturnValue( false );
	} );

	it( 'applies to onboarding from 600 px', () => {
		const { result } = renderHook( () => useBrandedAccountLayout( 'onboarding' ) );

		expect( result.current ).toBe( true );
	} );

	it( 'leaves out other flows', () => {
		const { result } = renderHook( () => useBrandedAccountLayout( 'hosting-start' ) );

		expect( result.current ).toBe( false );
	} );

	it( 'leaves out viewports below 600 px', () => {
		mockUseViewportMatch.mockReturnValue( true );

		const { result } = renderHook( () => useBrandedAccountLayout( 'onboarding' ) );

		expect( result.current ).toBe( false );
	} );

	it.each( [
		[ 'Woo-referrer users', 'ref=woo-hosting-solutions-flow' ],
		[ 'the theme grid layout', 'signup_layout=theme_grid' ],
	] )( 'leaves out %s', ( _label, query ) => {
		mockUseQuery.mockReturnValue( new URLSearchParams( query ) );

		const { result } = renderHook( () => useBrandedAccountLayout( 'onboarding' ) );

		expect( result.current ).toBe( false );
	} );
} );
