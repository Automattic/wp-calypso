/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { pollForBuildWowStatus } from '../build-status-poller';
import { useSiteGeneration } from '../use-site-generation';

jest.mock( '../build-status-poller', () => ( {
	pollForBuildWowStatus: jest.fn( () => jest.fn() ),
} ) );

jest.mock( 'calypso/landing/stepper/utils/build-wow', () => ( {
	logBuildWowEvent: jest.fn(),
} ) );

const pollMock = pollForBuildWowStatus as jest.Mock;

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
	} );

	it( 'advances to the final step once the backend reports a real delivery status', () => {
		const { result } = renderHook( () =>
			useSiteGeneration( {
				siteIdentifier: '123',
				editorUrl: 'https://example.wordpress.com/wp-admin/site-editor.php',
				steps: STEPS,
			} )
		);

		const { onProgress } = pollMock.mock.calls[ 0 ][ 0 ];
		act( () => {
			onProgress( 'activating' );
		} );

		const steps = result.current.steps;
		expect( steps[ steps.length - 1 ].status ).toBe( 'active' );
		expect( steps[ 0 ].status ).toBe( 'complete' );
		expect( steps[ 1 ].status ).toBe( 'complete' );
	} );
} );
