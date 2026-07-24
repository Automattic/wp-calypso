/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { pollForBuildWowReadySticker } from '../blog-sticker-poller';
import { useSiteGeneration } from '../use-site-generation';

jest.mock( '../blog-sticker-poller', () => ( {
	pollForBuildWowReadySticker: jest.fn( () => jest.fn() ),
} ) );

const pollMock = pollForBuildWowReadySticker as jest.Mock;

const STEPS = [
	{ id: 'preparing', label: 'Preparing your site' },
	{ id: 'building', label: 'Building your pages' },
];

describe( 'useSiteGeneration', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		pollMock.mockClear();
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
} );
