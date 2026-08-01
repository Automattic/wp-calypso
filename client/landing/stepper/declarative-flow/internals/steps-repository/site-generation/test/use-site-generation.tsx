/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { logBuildWowEvent } from 'calypso/landing/stepper/utils/build-wow';
import { pollForBuildWowStatus } from '../build-status-poller';
import { useSiteGeneration } from '../use-site-generation';

jest.mock( '../build-status-poller', () => ( {
	...jest.requireActual( '../build-status-poller' ),
	pollForBuildWowStatus: jest.fn( () => jest.fn() ),
} ) );

jest.mock( 'calypso/landing/stepper/utils/build-wow', () => ( {
	logBuildWowEvent: jest.fn(),
} ) );

const pollMock = pollForBuildWowStatus as jest.Mock;
const logMock = logBuildWowEvent as jest.Mock;

// Mirrors the five steps site-generation/index.tsx ships. A shorter fixture would
// be degenerate: at three steps the delivery-phase mapping collapses to identity.
const STEPS = [
	{ id: 'preparing', label: 'Preparing your site' },
	{ id: 'designing', label: 'Choosing your design' },
	{ id: 'building', label: 'Building your pages' },
	{ id: 'polishing', label: 'Polishing your design' },
	{ id: 'finalizing', label: 'Getting everything ready' },
];

describe( 'useSiteGeneration', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		pollMock.mockClear();
		pollMock.mockReturnValue( jest.fn() );
		logMock.mockClear();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'fails with missing-parameters when the editor URL is absent', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( { siteIdentifier: '123', editorUrl: null, steps: STEPS } )
		);

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.failureReason ).toBe( 'missing-parameters' );
		expect( pollMock ).not.toHaveBeenCalled();
	} );

	it( 'polls while working and fails with timed-out after the generation deadline', () => {
		const stopPolling = jest.fn();
		pollMock.mockReturnValue( stopPolling );

		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		expect( result.current.status ).toBe( 'working' );
		expect( pollMock ).toHaveBeenCalledTimes( 1 );

		act( () => {
			jest.advanceTimersByTime( 30 * 60 * 1000 );
		} );

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.failureReason ).toBe( 'timed-out' );
		expect( stopPolling ).toHaveBeenCalled();
	} );

	it( 'shows the calm fallback (never an error) when the backend reports a failed build', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onFailed } = pollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onFailed( 'failed:build_wow_theme_activation_failed' );
		} );

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.failureReason ).toBe( 'timed-out' );
		expect( logMock ).toHaveBeenCalledWith( 'site_generation_failed', {
			status: 'failed:build_wow_theme_activation_failed',
			site_identifier: '123',
		} );
	} );

	it( 'maps each delivery phase to its own step rather than jumping to the last', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onProgress } = pollMock.mock.calls[ 0 ][ 0 ];

		// `delivering` is the status already recorded when this screen loads, so it
		// must not complete the whole list.
		act( () => {
			onProgress( 'delivering' );
		} );
		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'complete',
			'complete',
			'active',
			'pending',
			'pending',
		] );

		act( () => {
			onProgress( 'activating' );
		} );
		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'complete',
			'complete',
			'complete',
			'active',
			'pending',
		] );

		act( () => {
			onProgress( 'verifying' );
		} );
		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'complete',
			'complete',
			'complete',
			'complete',
			'active',
		] );
	} );

	it( 'stops polling when the hook unmounts', () => {
		const stopPolling = jest.fn();
		pollMock.mockReturnValue( stopPolling );

		const { unmount } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		expect( stopPolling ).not.toHaveBeenCalled();
		unmount();
		expect( stopPolling ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'logs a status request failure with the site it belongs to', () => {
		renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onRequestError } = pollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onRequestError( '502 Bad gateway' );
		} );

		expect( logMock ).toHaveBeenCalledWith( 'site_generation_status_request_failed', {
			site_identifier: '123',
			error: '502 Bad gateway',
		} );
	} );

	it( 'keeps the active step in range for a list shorter than the timer sequence', () => {
		const shortSteps = STEPS.slice( 0, 2 );
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: shortSteps,
			} )
		);

		// STEP_DELAYS drives the index past the end of a two-step list; without the
		// clamp every step reads complete and none is active.
		act( () => {
			jest.advanceTimersByTime( 140000 );
		} );

		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'complete',
			'active',
		] );
	} );

	it( 'never moves progress backwards when statuses arrive out of order', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onProgress } = pollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onProgress( 'verifying' );
			onProgress( 'delivering' );
		} );

		const steps = result.current.steps;
		expect( steps[ steps.length - 1 ].status ).toBe( 'active' );
	} );

	it( 'ignores an unrecognized status instead of advancing progress', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onProgress } = pollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onProgress( 'something-unexpected' );
		} );

		expect( result.current.steps[ 0 ].status ).toBe( 'active' );
	} );
} );
