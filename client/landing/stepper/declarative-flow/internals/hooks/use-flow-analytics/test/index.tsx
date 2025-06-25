/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { DURATION, useFlowAnalytics } from '../';
import { recordFlowStart } from '../../../analytics/record-flow-start';

jest.mock( '../../../analytics/record-flow-start' );

describe( 'useFlowAnalytics', () => {
	const buildWrapper =
		( { initialEntries } ) =>
		( { children } ) => <MemoryRouter initialEntries={ initialEntries }>{ children }</MemoryRouter>;

	const render = (
		renderOptions = { initialEntries: [ '/setup/flow' ] },
		hookOptions: Parameters< typeof useFlowAnalytics >[ 1 ] = { enabled: true }
	) => {
		const Wrapper = buildWrapper( renderOptions );
		return renderHook(
			() => useFlowAnalytics( { flow: 'flow', step: 'step', variant: 'variant' }, hookOptions ),
			{ wrapper: Wrapper }
		);
	};

	beforeEach( () => {
		sessionStorage.clear();
		jest.clearAllMocks();
		jest.useFakeTimers();
	} );

	afterAll( () => {
		jest.useRealTimers();
	} );

	it( 'tracks the flow start', () => {
		render();

		expect( recordFlowStart ).toHaveBeenCalledWith( 'flow', {
			ref: null,
			site_id: null,
			site_slug: null,
			step: 'step',
			variant: 'variant',
		} );
	} );

	it( 'tracks using the ref when available', () => {
		render( { initialEntries: [ '/setup/flow?ref=previous-flow' ] } );

		expect( recordFlowStart ).toHaveBeenCalledWith( 'flow', {
			ref: 'previous-flow',
			step: 'step',
			site_id: null,
			site_slug: null,
			variant: 'variant',
		} );
	} );

	it( 'tracks using siteId and slug when available', () => {
		render( { initialEntries: [ '/setup/flow?siteId=123&siteSlug=somesite.example.com' ] } );

		expect( recordFlowStart ).toHaveBeenCalledWith( 'flow', {
			ref: null,
			step: 'step',
			site_id: '123',
			site_slug: 'somesite.example.com',
			variant: 'variant',
		} );
	} );

	it( 'doesn"t track the same flow', () => {
		render();
		render();

		expect( recordFlowStart ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'doesn`t track the flow when the hook is disabled', () => {
		render( { initialEntries: [ '/setup/flow' ] }, { enabled: false } );

		expect( recordFlowStart ).not.toHaveBeenCalled();
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
