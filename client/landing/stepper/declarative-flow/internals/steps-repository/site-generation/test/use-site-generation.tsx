/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { logBuildWowEvent, requestBuildWowSite } from 'calypso/landing/stepper/utils/build-wow';
import { pollForBuildWowStatus } from '../build-status-poller';
import { useSiteGeneration } from '../use-site-generation';

jest.mock( '../build-status-poller', () => ( {
	...jest.requireActual( '../build-status-poller' ),
	pollForBuildWowStatus: jest.fn( () => jest.fn() ),
} ) );

jest.mock( 'calypso/landing/stepper/utils/build-wow', () => ( {
	logBuildWowEvent: jest.fn(),
	requestBuildWowSite: jest.fn(),
} ) );

const statusPollMock = pollForBuildWowStatus as jest.Mock;
const logMock = logBuildWowEvent as jest.Mock;
const requestBuildWowSiteMock = requestBuildWowSite as jest.Mock;
const originalLocation = window.location;

const STEPS = [
	{ id: 'preparing', label: 'Preparing your site' },
	{ id: 'designing', label: 'Choosing your design' },
	{ id: 'building', label: 'Building your pages' },
	{ id: 'images', label: 'Adding your images' },
	{ id: 'polishing', label: 'Polishing your site' },
	{ id: 'publishing', label: 'Publishing your site' },
];

// A server checklist in the shape big_sky_build_wow_status_ui_steps() emits.
const SERVER_STEPS = ( activeIndex: number ) =>
	[
		{ id: 'prepare', label: 'Preparing your site' },
		{ id: 'design', label: 'Choosing your design' },
		{ id: 'pages', label: 'Building your pages' },
		{ id: 'images', label: 'Adding your images' },
		{ id: 'polish', label: 'Polishing your site' },
		{ id: 'publish', label: 'Publishing your site' },
	].map( ( step, index ) => {
		let state = 'pending';
		if ( index < activeIndex ) {
			state = 'done';
		} else if ( index === activeIndex ) {
			state = 'active';
		}
		return { ...step, state };
	} );

describe( 'useSiteGeneration', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		statusPollMock.mockClear();
		statusPollMock.mockReturnValue( jest.fn() );
		logMock.mockClear();
		requestBuildWowSiteMock.mockReset();
		requestBuildWowSiteMock.mockResolvedValue( {} );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'fails with missing-parameters when the editor URL is absent', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: null,
				steps: STEPS,
			} )
		);

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.failureReason ).toBe( 'missing-parameters' );
		expect( statusPollMock ).not.toHaveBeenCalled();
	} );

	it( 'polls while working and fails with timed-out after the generation deadline', () => {
		const stopStatusPolling = jest.fn();
		statusPollMock.mockReturnValue( stopStatusPolling );

		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		expect( result.current.status ).toBe( 'working' );
		expect( statusPollMock ).toHaveBeenCalledTimes( 1 );

		act( () => {
			jest.advanceTimersByTime( 30 * 60 * 1000 );
		} );

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.failureReason ).toBe( 'timed-out' );
		expect( stopStatusPolling ).toHaveBeenCalled();
	} );

	it( 'shows the calm fallback when the backend reports a failed build without UI', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onFailed } = statusPollMock.mock.calls[ 0 ][ 0 ];
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

	it( 'redirects only when the build status poller reports that the site is ready', () => {
		// The stub is scoped here because this is the only test that asserts on
		// window.location.assign.
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
			configurable: true,
		} );

		try {
			renderHook( () =>
				useSiteGeneration( {
					siteIdentifier: '123',
					editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
					steps: STEPS,
				} )
			);

			const { onReady } = statusPollMock.mock.calls[ 0 ][ 0 ];
			act( () => {
				onReady();
			} );
			expect( window.location.assign ).toHaveBeenCalledWith(
				'https://example.wordpress.com/wp-admin/site-editor.php?from=site-generation'
			);
		} finally {
			Object.defineProperty( window, 'location', {
				value: originalLocation,
				configurable: true,
			} );
		}
	} );

	it( 'starts on the fallback checklist until the server checklist arrives', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'active',
			'idle',
			'idle',
			'idle',
			'idle',
			'idle',
		] );
		expect( result.current.steps[ 0 ].label ).toBe( 'Preparing your site' );
		expect( result.current.steps[ 0 ].startedAt ).toEqual( expect.any( Number ) );
	} );

	it( 'renders the server checklist verbatim once it arrives', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onUpdate } = statusPollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onUpdate( { state: 'generating', steps: SERVER_STEPS( 2 ) } );
		} );

		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'done',
			'done',
			'active',
			'idle',
			'idle',
			'idle',
		] );
		expect( result.current.steps[ 2 ].id ).toBe( 'pages' );

		// Later polls keep replacing the checklist — the server owns it.
		act( () => {
			onUpdate( { state: 'finishing', steps: SERVER_STEPS( 4 ) } );
		} );
		expect( result.current.steps[ 4 ].status ).toBe( 'active' );
	} );

	it( 'keeps the active step start time until the server advances', () => {
		jest.setSystemTime( 1723032220000 );
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onUpdate } = statusPollMock.mock.calls[ 0 ][ 0 ];
		act( () => onUpdate( { state: 'generating', steps: SERVER_STEPS( 2 ) } ) );
		expect( result.current.steps[ 2 ].startedAt ).toBe( 1723032220000 );

		act( () => {
			jest.advanceTimersByTime( 10000 );
			onUpdate( { state: 'generating', steps: SERVER_STEPS( 2 ) } );
		} );
		expect( result.current.steps[ 2 ].startedAt ).toBe( 1723032220000 );

		act( () => onUpdate( { state: 'generating', steps: SERVER_STEPS( 3 ) } ) );
		expect( result.current.steps[ 3 ].startedAt ).toBe( 1723032230000 );
	} );

	it( 'keeps the fallback checklist when a response carries no usable steps', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onUpdate } = statusPollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onUpdate( { state: 'queued', steps: [] } );
			onUpdate( { state: 'queued' } );
		} );

		expect( result.current.steps ).toHaveLength( STEPS.length );
		expect( result.current.steps[ 0 ].status ).toBe( 'active' );
	} );

	it( 'surfaces a server build failure with its copy and a retry affordance', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				specId: 'spec-1',
				steps: STEPS,
			} )
		);

		const { onFailed } = statusPollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onFailed( 'failed:generation_failed', {
				state: 'failed',
				can_retry: true,
				label: 'We couldn’t finish building your site',
				detail: 'You can start the build again right away.',
			} );
		} );

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.failureReason ).toBe( 'build-failed' );
		expect( result.current.failureLabel ).toBe( 'We couldn’t finish building your site' );
		expect( result.current.failureDetail ).toBe( 'You can start the build again right away.' );
		expect( result.current.retryBuild ).not.toBeNull();
	} );

	it( 'offers no retry without a specId, or when the server withholds can_retry', () => {
		const { result: withoutSpec } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);
		act( () => {
			statusPollMock.mock.calls[ 0 ][ 0 ].onFailed( 'failed:generation_failed', {
				state: 'failed',
				can_retry: true,
			} );
		} );
		expect( withoutSpec.current.failureReason ).toBe( 'build-failed' );
		expect( withoutSpec.current.retryBuild ).toBeNull();

		const { result: withoutRetry } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				specId: 'spec-1',
				steps: STEPS,
			} )
		);
		act( () => {
			statusPollMock.mock.calls[ 1 ][ 0 ].onFailed( 'failed:generation_failed', {
				state: 'failed',
				can_retry: false,
			} );
		} );
		expect( withoutRetry.current.failureReason ).toBe( 'build-failed' );
		expect( withoutRetry.current.retryBuild ).toBeNull();
	} );

	it( 're-queues the build and resumes polling when retryBuild is called', async () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				specId: 'spec-1',
				steps: STEPS,
			} )
		);

		act( () => {
			statusPollMock.mock.calls[ 0 ][ 0 ].onFailed( 'failed:generation_failed', {
				state: 'failed',
				can_retry: true,
			} );
		} );
		act( () => {
			statusPollMock.mock.calls[ 0 ][ 0 ].onUpdate?.( {
				state: 'failed',
				steps: SERVER_STEPS( 3 ),
			} );
		} );
		expect( result.current.status ).toBe( 'failed' );

		await act( async () => {
			result.current.retryBuild?.();
		} );

		expect( requestBuildWowSiteMock ).toHaveBeenCalledWith( '123', 'spec-1', undefined );
		expect( logMock ).toHaveBeenCalledWith( 'site_generation_retry_requested', {
			site_identifier: '123',
			spec_id: 'spec-1',
		} );
		expect( result.current.status ).toBe( 'working' );
		expect( result.current.retryBuild ).toBeNull();
		expect( statusPollMock ).toHaveBeenCalledTimes( 2 );
		expect( result.current.steps[ 0 ].label ).toBe( 'Preparing your site' );
		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'active',
			'idle',
			'idle',
			'idle',
			'idle',
			'idle',
		] );
	} );

	it( 'stays on the failure screen and logs when the retry request fails', async () => {
		requestBuildWowSiteMock.mockRejectedValue( new Error( 'boom' ) );
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				specId: 'spec-1',
				steps: STEPS,
			} )
		);

		act( () => {
			statusPollMock.mock.calls[ 0 ][ 0 ].onFailed( 'failed:generation_failed', {
				state: 'failed',
				can_retry: true,
			} );
		} );

		await act( async () => {
			result.current.retryBuild?.();
		} );

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.failureReason ).toBe( 'build-failed' );
		expect( result.current.retryBuild ).not.toBeNull();
		expect( result.current.isRetryingBuild ).toBe( false );
		expect( logMock ).toHaveBeenCalledWith( 'site_generation_retry_failed', {
			site_identifier: '123',
			spec_id: 'spec-1',
			error: 'boom',
		} );
		expect( statusPollMock ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'never downgrades a server failure verdict to timed-out', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				specId: 'spec-1',
				steps: STEPS,
			} )
		);

		act( () => {
			statusPollMock.mock.calls[ 0 ][ 0 ].onFailed( 'failed:generation_failed', {
				state: 'failed',
				can_retry: true,
			} );
		} );
		act( () => {
			jest.advanceTimersByTime( 30 * 60 * 1000 );
		} );

		expect( result.current.failureReason ).toBe( 'build-failed' );
	} );
} );
