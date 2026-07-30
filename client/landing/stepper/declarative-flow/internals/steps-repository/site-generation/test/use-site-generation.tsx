/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { logBuildWowEvent } from 'calypso/landing/stepper/utils/build-wow';
import { pollForBuildProgress } from '../build-progress-poller';
import { pollForBuildWowStatus } from '../build-status-poller';
import { useSiteGeneration } from '../use-site-generation';

jest.mock( '../build-progress-poller', () => ( {
	...jest.requireActual( '../build-progress-poller' ),
	pollForBuildProgress: jest.fn( () => jest.fn() ),
} ) );

jest.mock( '../build-status-poller', () => ( {
	...jest.requireActual( '../build-status-poller' ),
	pollForBuildWowStatus: jest.fn( () => jest.fn() ),
} ) );

jest.mock( 'calypso/landing/stepper/utils/build-wow', () => ( {
	logBuildWowEvent: jest.fn(),
} ) );

const progressPollMock = pollForBuildProgress as jest.Mock;
const statusPollMock = pollForBuildWowStatus as jest.Mock;
const logMock = logBuildWowEvent as jest.Mock;
const originalLocation = window.location;

const STEPS = [
	{ id: 'preparing', label: 'Preparing your site' },
	{ id: 'designing', label: 'Choosing your design' },
	{ id: 'building', label: 'Building your pages' },
	{ id: 'images', label: 'Adding your images' },
	{ id: 'polishing', label: 'Polishing your site' },
	{ id: 'publishing', label: 'Publishing your site' },
];

describe( 'useSiteGeneration', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
			configurable: true,
		} );
		progressPollMock.mockClear();
		progressPollMock.mockReturnValue( jest.fn() );
		statusPollMock.mockClear();
		statusPollMock.mockReturnValue( jest.fn() );
		logMock.mockClear();
	} );

	afterEach( () => {
		jest.useRealTimers();
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			configurable: true,
		} );
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
		expect( progressPollMock ).not.toHaveBeenCalled();
		expect( statusPollMock ).not.toHaveBeenCalled();
	} );

	it( 'polls while working and fails with timed-out after the generation deadline', () => {
		const stopProgressPolling = jest.fn();
		const stopStatusPolling = jest.fn();
		progressPollMock.mockReturnValue( stopProgressPolling );
		statusPollMock.mockReturnValue( stopStatusPolling );

		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		expect( result.current.status ).toBe( 'working' );
		expect( progressPollMock ).toHaveBeenCalledTimes( 1 );
		expect( statusPollMock ).toHaveBeenCalledTimes( 1 );

		act( () => {
			jest.advanceTimersByTime( 30 * 60 * 1000 );
		} );

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.failureReason ).toBe( 'timed-out' );
		expect( stopProgressPolling ).toHaveBeenCalled();
		expect( stopStatusPolling ).toHaveBeenCalled();
	} );

	it( 'shows the calm fallback (never an error) when the backend reports a failed build', () => {
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
		renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onProgress } = progressPollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onProgress( { current: 'done' } );
		} );
		expect( window.location.assign ).not.toHaveBeenCalled();

		const { onReady } = statusPollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onReady();
		} );
		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/site-editor.php'
		);
	} );

	it( 'advances from persisted generation milestones and keeps completed steps visible', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onProgress } = progressPollMock.mock.calls[ 0 ][ 0 ];

		act( () => {
			onProgress( { current: 'theme-json' } );
		} );
		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'complete',
			'active',
			'pending',
			'pending',
			'pending',
			'pending',
		] );

		act( () => {
			onProgress( { current: 'assemble-pages' } );
		} );
		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'complete',
			'complete',
			'complete',
			'active',
			'pending',
			'pending',
		] );
	} );

	it( 'moves to publishing when theme generation completes', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onProgress } = progressPollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onProgress( { current: 'generate' } );
		} );
		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
			'complete',
			'complete',
			'complete',
			'complete',
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

		const { onProgress } = progressPollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onProgress( { current: 'validate-theme' } );
			onProgress( { current: 'theme-json' } );
		} );

		expect( result.current.steps[ 4 ].status ).toBe( 'active' );
	} );

	it( 'ignores an unrecognized status instead of advancing progress', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onProgress } = progressPollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onProgress( { current: 'internal-step' } );
		} );

		expect( result.current.steps[ 0 ].status ).toBe( 'active' );
	} );
} );
