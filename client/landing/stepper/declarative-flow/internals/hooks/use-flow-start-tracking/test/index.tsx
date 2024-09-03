/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { DURATION, useFlowStartTracking } from '..';
import { STEPPER_TRACKS_EVENT_FLOW_START } from '../../../../../constants';
import { Flow } from '../../../types';

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	recordTracksEvent: jest.fn(),
} ) );

const regularFlow: Flow = {
	name: 'regular-flow',
	useSteps: () => [],
	useStepNavigation: () => ( {} ),
	isSignupFlow: false,
	variantSlug: 'variant',
};

const defaultTracksEventProps = {
	flow: 'regular-flow',
	ref: null,
	site_id: null,
	site_slug: null,
	step: 'step',
	variant: 'variant',
	device: resolveDeviceTypeByViewPort(),
};

describe( 'useFlowStartTracking', () => {
	const buildWrapper =
		( { initialEntries } ) =>
		( { children } ) => <MemoryRouter initialEntries={ initialEntries }>{ children }</MemoryRouter>;

	const render = ( options = { initialEntries: [ '/setup/flow' ] } ) => {
		const Wrapper = buildWrapper( options );
		return renderHook(
			() =>
				useFlowStartTracking( {
					flow: regularFlow,
					step: 'step',
				} ),
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

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			STEPPER_TRACKS_EVENT_FLOW_START,
			defaultTracksEventProps
		);
	} );

	it( 'tracks using the ref when available', () => {
		render( { initialEntries: [ '/setup/flow?ref=previous-flow' ] } );

		expect( recordTracksEvent ).toHaveBeenCalledWith( STEPPER_TRACKS_EVENT_FLOW_START, {
			...defaultTracksEventProps,
			ref: 'previous-flow',
		} );
	} );

	it( 'tracks using siteId and slug when available', () => {
		render( { initialEntries: [ '/setup/flow?siteId=123&siteSlug=somesite.example.com' ] } );

		expect( recordTracksEvent ).toHaveBeenCalledWith( STEPPER_TRACKS_EVENT_FLOW_START, {
			...defaultTracksEventProps,
			site_id: '123',
			site_slug: 'somesite.example.com',
		} );
	} );

	it( "doesn't track the same flow", () => {
		render();
		render();

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			STEPPER_TRACKS_EVENT_FLOW_START,
			defaultTracksEventProps
		);
	} );

	it( 'tracks the same flow after 20 min', () => {
		render();
		jest.advanceTimersByTime( DURATION + 100 );
		render();

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( recordTracksEvent ).toHaveBeenNthCalledWith(
			1,
			STEPPER_TRACKS_EVENT_FLOW_START,
			defaultTracksEventProps
		);
		expect( recordTracksEvent ).toHaveBeenNthCalledWith(
			2,
			STEPPER_TRACKS_EVENT_FLOW_START,
			defaultTracksEventProps
		);
	} );

	it( 'tracks the same flow with different site id', () => {
		render( { initialEntries: [ '/setup/flow?siteId=123' ] } );
		render( { initialEntries: [ '/setup/flow?siteId=456' ] } );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( recordTracksEvent ).toHaveBeenNthCalledWith( 1, STEPPER_TRACKS_EVENT_FLOW_START, {
			...defaultTracksEventProps,
			site_id: '123',
		} );
		expect( recordTracksEvent ).toHaveBeenNthCalledWith( 2, STEPPER_TRACKS_EVENT_FLOW_START, {
			...defaultTracksEventProps,
			site_id: '456',
		} );
	} );
} );
