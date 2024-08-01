/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { DURATION, useFlowAnalyctis } from '../';
import { recordFlowStart } from '../../../analytics/record-flow-start';

jest.mock( '../../../analytics/record-flow-start' );

describe( 'useFlowAnalyctis', () => {
	const buildWrapper =
		( { initialEntries } ) =>
		( { children } ) => <MemoryRouter initialEntries={ initialEntries }>{ children }</MemoryRouter>;

	const render = ( options = { initialEntries: [ '/setup/flow' ] } ) => {
		const Wrapper = buildWrapper( options );
		return renderHook(
			() => useFlowAnalyctis( { flow: 'flow', step: 'step', variant: 'variant' } ),
			{ wrapper: Wrapper }
		);
	};

	beforeAll( () => {} );

	beforeEach( () => {
		localStorage.clear();
		jest.clearAllMocks();
		jest.useFakeTimers();
	} );

	afterAll( () => {
		jest.useRealTimers();
	} );

	it( 'tracks the flow start', () => {
		render();

		expect( recordFlowStart ).toHaveBeenCalledWith( 'flow', 'step', 'variant', { ref: null } );
	} );

	it( 'tracks the ref', () => {
		render( { initialEntries: [ '/setup/flow?ref=previous-flow' ] } );

		expect( recordFlowStart ).toHaveBeenCalledWith( 'flow', 'step', 'variant', {
			ref: 'previous-flow',
		} );
	} );

	it( 'doesn"t track the same flow', () => {
		render();
		render();

		expect( recordFlowStart ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'tracks the same flow after 20 min', () => {
		render();
		jest.advanceTimersByTime( DURATION + 100 );
		render();

		expect( recordFlowStart ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'tracks the same flow with different site id', () => {
		render( { initialEntries: [ '/setup/flow?siteId=123' ] } );
		render( { initialEntries: [ '/setup/flow?siteId=456' ] } );

		expect( recordFlowStart ).toHaveBeenCalledTimes( 2 );
	} );
} );
