/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { LogType, type Site } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import SiteLogsDataViews from '../index';
import type { DeepPartial } from 'utility-types';

const API_BASE = 'https://public-api.wordpress.com';
const mockSiteId = 123;

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: jest.fn(),
	} ),
	useRegistry: () => ( {} ),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn( ( selector ) => selector ),
	store: jest.fn(),
	select: jest.fn(),
	dispatch: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_x: ( text: string ) => text,
	isRTL: () => false,
	sprintf: ( text: string ) => text,
} ) );

const mockSite: DeepPartial< Site > = {
	ID: mockSiteId,
	slug: 'test-site',
};

function mockPreferences() {
	nock( API_BASE )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
}

function mockPhpLogsOnce() {
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ mockSiteId }/hosting/error-logs` )
		.query( true )
		.reply( 200, {
			message: 'ok',
			data: {
				total_results: 1,
				logs: [
					{
						timestamp: '2025-01-01T00:00:01Z',
						severity: 'User',
						message: 'Hello',
						kind: 'k',
						name: 'n',
						file: '/f',
						line: 1,
						atomic_site_id: mockSiteId,
					},
				],
				scroll_id: null,
			},
		} );
}

function mockServerLogsOnce() {
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ mockSiteId }/hosting/logs` )
		.query( true )
		.reply( 200, {
			message: 'ok',
			data: {
				total_results: 1,
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
			},
		} );
}

const fixedDateRange = {
	start: new Date( Date.UTC( 2025, 0, 1, 0, 0, 0 ) ),
	end: new Date( Date.UTC( 2025, 0, 2, 0, 0, 0 ) ),
};

describe( 'SiteLogsDataViews', () => {
	test( 'renders PHP logs and syncs URL params', async () => {
		const replaceSpy = jest.spyOn( window.history, 'replaceState' );
		mockPreferences();
		mockPhpLogsOnce();

		render(
			<SiteLogsDataViews
				gmtOffset={ -8 }
				timezoneString="America/Los_Angeles"
				site={ mockSite as Site }
				dateRange={ fixedDateRange }
				autoRefresh={ false }
				setAutoRefresh={ jest.fn() }
				logType={ LogType.PHP }
			/>
		);

		expect( await screen.findByText( 'Auto-refresh' ) ).toBeVisible();
		// Also verify PHP logs content renders
		expect( await screen.findByText( 'Hello', {}, { timeout: 5000 } ) ).toBeVisible();
		expect( await screen.findByText( 'User', {}, { timeout: 5000 } ) ).toBeVisible();
		expect( replaceSpy ).toHaveBeenCalled();
		replaceSpy.mockRestore();
	} );

	test( 'renders Server logs', async () => {
		mockPreferences();
		mockServerLogsOnce();

		render(
			<SiteLogsDataViews
				gmtOffset={ -8 }
				timezoneString="America/Los_Angeles"
				site={ mockSite as Site }
				dateRange={ fixedDateRange }
				autoRefresh={ false }
				setAutoRefresh={ jest.fn() }
				logType={ LogType.SERVER }
			/>
		);

		expect( await screen.findByText( 'Auto-refresh' ) ).toBeVisible();
		// Also verify Server logs content renders
		expect( await screen.findByText( 'GET', {}, { timeout: 5000 } ) ).toBeVisible();
		expect( await screen.findByText( '/index', {}, { timeout: 5000 } ) ).toBeVisible();
	} );

	// If the parent blocks auto-refresh via onAutoRefreshRequest, the toggle click should be ignored and no analytics event emitted.
	test( 'auto-refresh toggle blocked by onAutoRefreshRequest', async () => {
		mockPreferences();
		mockPhpLogsOnce();
		const user = userEvent.setup();
		const autoRefresh = jest.fn();

		const { recordTracksEvent } = render(
			<SiteLogsDataViews
				gmtOffset={ -8 }
				timezoneString="America/Los_Angeles"
				site={ mockSite as Site }
				dateRange={ fixedDateRange }
				autoRefresh={ false }
				onAutoRefreshRequest={ () => false }
				setAutoRefresh={ autoRefresh }
				logType={ LogType.PHP }
			/>
		);

		const toggle = await screen.findByRole( 'checkbox', { name: 'Auto-refresh' } );
		await user.click( toggle );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
		expect( autoRefresh ).not.toHaveBeenCalled();
	} );

	// When the parent supplies 'autoRefreshDisabledReason', the toggle control must be disabled to prevent interaction.
	test( 'auto-refresh toggle is disabled when reason provided', async () => {
		mockPreferences();
		mockPhpLogsOnce();

		render(
			<SiteLogsDataViews
				gmtOffset={ -8 }
				timezoneString="America/Los_Angeles"
				site={ mockSite as Site }
				dateRange={ fixedDateRange }
				autoRefresh={ false }
				autoRefreshDisabledReason="blocked"
				setAutoRefresh={ jest.fn() }
				logType={ LogType.PHP }
			/>
		);

		const toggle = await screen.findByRole( 'checkbox', { name: 'Auto-refresh' } );
		expect( toggle ).toBeDisabled();
	} );
} );
