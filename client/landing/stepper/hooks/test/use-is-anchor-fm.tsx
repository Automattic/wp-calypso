/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import { useIsAnchorFm } from '../use-is-anchor-fm';

describe( 'use-is-anchor-fm tests', () => {
	const RouteWrapper: React.FC = ( props: { children?: React.ReactNode; path: string } ) => (
		<Router initialEntries={ [ props.path ] }>{ props.children }</Router>
	);

	test( 'Returns true for a valid podcast ID', () => {
		const { result } = renderHook( () => useIsAnchorFm(), {
			wrapper: RouteWrapper,
			initialProps: { path: '?anchor_podcast=eb12e6c' },
		} );
		expect( result.current ).toEqual( true );
	} );

	test( 'Returns false for an invalid podcast ID', () => {
		const { result } = renderHook( () => useIsAnchorFm(), {
			wrapper: RouteWrapper,
			initialProps: { path: '?anchor_podcast=mmm' },
		} );
		expect( result.current ).toEqual( false );
	} );
} );
