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

const STEPS = [
	{ id: 'preparing', label: 'Preparing your site' },
	{ id: 'building', label: 'Building your pages' },
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
			'active',
			'pending',
			'pending',
		] );

		act( () => {
			onProgress( 'verifying' );
		} );
		expect( result.current.steps.map( ( step ) => step.status ) ).toEqual( [
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
