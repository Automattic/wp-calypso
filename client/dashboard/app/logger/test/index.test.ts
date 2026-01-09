/**
 * @jest-environment jsdom
 */

import { DashboardDataError, INACCESSIBLE_JETPACK_ERROR_CODE } from '@automattic/api-core';
import { captureException } from '@automattic/calypso-sentry';
import { logToLogstash } from 'calypso/lib/logstash';
import { handleOnCatch } from '../index';
import type { AnyRouter } from '@tanstack/react-router';
import type { ErrorInfo } from 'react';

jest.mock( '@automattic/calypso-config', () => jest.fn( () => 'development' ) );
jest.mock( '@automattic/calypso-sentry', () => ( {
	captureException: jest.fn(),
} ) );
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

const mockedLogToLogstash = jest.mocked( logToLogstash );
const mockedCaptureException = jest.mocked( captureException );

const createRouter = ( params: Record< string, string > ): AnyRouter =>
	( {
		state: {
			matches: [ { params } ],
		},
	} ) as unknown as AnyRouter;

const createErrorInfo = ( stack = 'at SomeComponent' ): ErrorInfo => ( {
	componentStack: stack,
} );

describe( 'handleOnCatch', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'does not log or capture benign DashboardDataError (inaccessible Jetpack site)', () => {
		const error = new DashboardDataError( INACCESSIBLE_JETPACK_ERROR_CODE );
		const errorInfo = createErrorInfo();
		const router = createRouter( { siteSlug: 'my-site' } );

		handleOnCatch( error, errorInfo, router, {
			severity: 'error',
			dashboard_backport: false,
			calypso_section: 'dashboard',
		} );

		expect( mockedLogToLogstash ).not.toHaveBeenCalled();
		expect( mockedCaptureException ).not.toHaveBeenCalled();
	} );

	it( 'logs and captures a non-benign error', () => {
		const error = new Error( 'Boom' );
		const errorInfo = createErrorInfo( 'at SitePage' );
		const router = createRouter( { siteSlug: 'my-site', someId: '123' } );

		handleOnCatch( error, errorInfo, router, {
			severity: 'error',
			dashboard_backport: false,
			calypso_section: 'dashboard',
		} );

		expect( mockedLogToLogstash ).toHaveBeenCalledTimes( 1 );
		expect( mockedLogToLogstash ).toHaveBeenCalledWith( {
			feature: 'calypso_client',
			message: 'Boom',
			severity: 'error',
			tags: [ 'dashboard' ],
			properties: {
				dashboard_backport: false,
				env: 'development',
				message: 'Boom',
				stack: 'at SitePage',
				path: 'https://example.com/',
				params: {
					site_slug: 'my-site',
					some_id: '123',
				},
			},
		} );

		expect( mockedCaptureException ).toHaveBeenCalledTimes( 1 );
		expect( mockedCaptureException ).toHaveBeenCalledWith( error, {
			tags: {
				calypso_section: 'dashboard',
				site_slug: 'my-site',
				some_id: '123',
			},
		} );
	} );

	it( 'logs but does not capture when dashboard_backport is true', () => {
		const error = new Error( 'Backport-only error' );
		const errorInfo = createErrorInfo();
		const router = createRouter( { siteSlug: 'my-site' } );

		handleOnCatch( error, errorInfo, router, {
			severity: 'debug',
			dashboard_backport: true,
			calypso_section: 'dashboard',
		} );

		expect( mockedLogToLogstash ).toHaveBeenCalledTimes( 1 );
		expect( mockedCaptureException ).not.toHaveBeenCalled();
	} );
} );
