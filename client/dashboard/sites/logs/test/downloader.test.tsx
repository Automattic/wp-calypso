/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { LogType, FilterType } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock, type MockInstance } from 'vitest';
import { render } from '../../../test-utils';
import { LogsDownloader } from '../downloader';
import type { JSX } from 'react';

vi.mock( '@wordpress/i18n', () => ( {
	__: ( s: string ) => s,
	sprintf: ( s: string ) => s,
} ) );

type VStackProps = {
	children: React.ReactNode;
	as?: keyof JSX.IntrinsicElements;
};

type HStackProps = {
	children: React.ReactNode;
	as?: keyof JSX.IntrinsicElements;
};

type ChildrenProps = { children?: React.ReactNode };

interface MockButtonProps {
	onClick?: () => void;
	'aria-label'?: string;
}

vi.mock( '@wordpress/components', () => ( {
	__experimentalVStack: ( { children }: VStackProps ) => <div>{ children }</div>,
	__experimentalHStack: ( { children }: HStackProps ) => <div>{ children }</div>,
	Tooltip: ( { children }: ChildrenProps ) => <div>{ children }</div>,
	Spinner: () => null,
	Button: ( { onClick, 'aria-label': ariaLabel }: MockButtonProps ) => (
		<button aria-label={ ariaLabel ?? 'Button' } onClick={ onClick }>
			button
		</button>
	),
} ) );

vi.mock( '@wordpress/icons', () => ( { download: 'download' } ) );

vi.mock( '@automattic/api-core', async () => {
	const actual =
		await vi.importActual< typeof import( '@automattic/api-core' ) >( '@automattic/api-core' );
	const fetchSiteLogsBatchMock = vi.fn();
	return {
		...actual,
		fetchSiteLogsBatch: ( ...args: unknown[] ) => fetchSiteLogsBatchMock( ...args ),
		__mocks: { fetchSiteLogsBatchMock },
	};
} );

let createObjectURLMock: Mock;
let revokeObjectURLMock: Mock;
let anchorClickSpy: MockInstance;

const { __mocks } = ( await import( '@automattic/api-core' ) ) as unknown as {
	__mocks: { fetchSiteLogsBatchMock: Mock };
};

beforeAll( () => {
	createObjectURLMock = vi.fn( () => 'blob:mock' );
	revokeObjectURLMock = vi.fn();
	// JSDOM: polyfill URL methods used in tests
	if ( ! window.URL ) {
		// @ts-expect-error test-only polyfill
		window.URL = {};
	}
	window.URL.createObjectURL = createObjectURLMock;
	window.URL.revokeObjectURL = revokeObjectURLMock;

	// Avoid JSDOM navigation errors when clicking the fake download link
	anchorClickSpy = vi.spyOn( HTMLAnchorElement.prototype, 'click' ).mockImplementation( () => {} );
} );

afterAll( () => {
	anchorClickSpy.mockRestore();
} );

test( 'downloads logs and records analytics', async () => {
	__mocks.fetchSiteLogsBatchMock.mockResolvedValueOnce( {
		logs: [
			{
				date: '2025-01-01T00:00:02Z',
				request_type: 'GET',
				status: '200',
				request_url: '/index',
				body_bytes_sent: 100,
				cached: 'true',
				http_host: 'example.com',
				http_referer: '',
				http2: 'h2',
				http_user_agent: 'ua',
				http_version: '2',
				http_x_forwarded_for: '',
				renderer: 'php',
				request_completion: 'OK',
				request_time: '10ms',
				scheme: 'https',
				timestamp: 1700000002,
				type: 'access',
				user_ip: '127.0.0.1',
			},
		],
		scroll_id: null,
		total_results: 1,
	} );

	const onSuccess = vi.fn();

	const { recordTracksEvent } = render(
		<LogsDownloader
			siteId={ 123 }
			siteSlug="test-site"
			logType={ LogType.SERVER }
			startSec={ 1 }
			endSec={ 2 }
			filter={ {} as FilterType }
			onSuccess={ onSuccess }
		/>
	);

	await userEvent.click( screen.getByRole( 'button', { name: 'Download logs' } ) );

	// Blob was created and revoked
	expect( createObjectURLMock ).toHaveBeenCalled();
	expect( revokeObjectURLMock ).toHaveBeenCalled();

	// Caller notified
	expect( onSuccess ).toHaveBeenCalledWith( 'Logs downloaded.' );

	expect( recordTracksEvent ).toHaveBeenNthCalledWith(
		2,
		'calypso_dashboard_site_logs_download_started',
		expect.objectContaining( { site_id: 123 } )
	);

	expect( recordTracksEvent ).toHaveBeenNthCalledWith(
		1,
		'calypso_dashboard_site_logs_download_completed',
		expect.objectContaining( { download_filename: 'test-site-server-logs-1-2.csv' } )
	);
} );
