/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import TimeMismatchNotice from '../index';

jest.mock( '@automattic/api-queries', () => ( {
	userPreferenceQuery: jest.fn( ( key: string ) => ( { queryKey: [ 'pref', key ] } ) ),
	userPreferenceMutation: jest.fn( ( key: string ) => ( { mutationKey: [ 'pref', key ] } ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	QueryClient: jest.fn().mockImplementation( () => ( {} ) ),
	QueryClientProvider: ( { children }: { children: React.ReactNode } ) => children,
	useSuspenseQuery: jest.fn(),
	useMutation: jest.fn(),
} ) );

function getOffsetHours() {
	const now = new Date();
	return -now.getTimezoneOffset() / 60;
}

describe( 'TimeMismatchNotice', () => {
	const mutateMock = jest.fn();
	let useSuspenseQuery: jest.Mock;
	let useMutation: jest.Mock;
	// Force a deterministic local timezone offset: -120 minutes => offsetHours = 2
	const mockTimezoneOffsetMinutes = -120;

	beforeEach( () => {
		const rq = require( '@tanstack/react-query' );
		useSuspenseQuery = rq.useSuspenseQuery as jest.Mock;
		useMutation = rq.useMutation as jest.Mock;

		useSuspenseQuery.mockReset();
		useMutation.mockReset();
		mutateMock.mockReset();
		useSuspenseQuery.mockReturnValue( { data: null } );
		useMutation.mockReturnValue( { mutate: mutateMock, isPending: false } );

		// Stub timezone offset to avoid potential environment-dependent behavior
		jest.spyOn( Date.prototype, 'getTimezoneOffset' ).mockReturnValue( mockTimezoneOffsetMinutes );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	test( 'does not render if siteTime matches local timezone offset', () => {
		useSuspenseQuery.mockReturnValue( { data: null } );

		const offsetHours = getOffsetHours();
		const { queryByRole } = render(
			<TimeMismatchNotice
				siteId={ 123 }
				siteTime={ offsetHours }
				settingsUrl="https://example.com"
			/>
		);

		expect( queryByRole( 'button', { name: /dismiss/i } ) ).toBeNull();
	} );

	test( 'renders warning notice when siteTime differs and no dismissal is stored', async () => {
		useSuspenseQuery.mockReturnValue( { data: null } );

		const offsetHours = getOffsetHours();
		render(
			<TimeMismatchNotice
				siteId={ 123 }
				siteTime={ offsetHours + 1 }
				settingsUrl="https://example.com"
			/>
		);

		expect( await screen.findByRole( 'button', { name: /dismiss/i } ) ).toBeVisible();

		expect( await screen.findByRole( 'link', { name: /update it if needed/i } ) ).toBeVisible();
	} );

	test( 'does not render when previously dismissed with same offset', () => {
		const offsetHours = getOffsetHours();
		useSuspenseQuery.mockReturnValue( {
			data: JSON.stringify( { dismissedAt: '2025-01-01T00:00:00.000Z', offsetHours } ),
		} );
		useMutation.mockReturnValue( { mutate: mutateMock, isPending: false } );

		const { queryByRole } = render(
			<TimeMismatchNotice
				siteId={ 123 }
				siteTime={ offsetHours + 2 }
				settingsUrl="https://example.com"
			/>
		);

		expect( queryByRole( 'button', { name: /dismiss/i } ) ).toBeNull();
	} );

	test( 'clicking the settings link records an analytics event', async () => {
		const user = userEvent.setup();
		useSuspenseQuery.mockReturnValue( { data: null } );

		const offsetHours = getOffsetHours();
		const { recordTracksEvent } = render(
			<TimeMismatchNotice
				siteId={ 987 }
				siteTime={ offsetHours + 1 }
				settingsUrl="https://example.com"
			/>
		);

		await user.click( await screen.findByRole( 'link', { name: /update it if needed/i } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_time_mismatch_banner_settings_link_click',
			expect.objectContaining( { site_id: 987 } )
		);
	} );

	test( 'clicking dismiss persists preference and records analytics', async () => {
		const user = userEvent.setup();
		useSuspenseQuery.mockReturnValue( { data: null } );

		const offsetHours = getOffsetHours();
		const { recordTracksEvent } = render(
			<TimeMismatchNotice
				siteId={ 321 }
				siteTime={ offsetHours + 1 }
				settingsUrl="https://example.com"
			/>
		);

		await user.click( await screen.findByRole( 'button', { name: /dismiss/i } ) );

		expect( mutateMock ).toHaveBeenCalledTimes( 1 );
		const payload = mutateMock.mock.calls[ 0 ][ 0 ] as string;
		const parsed = JSON.parse( payload );
		expect( typeof parsed.dismissedAt ).toBe( 'string' );
		// Avoid -0 vs 0 strict-equality issue
		expect( parsed.offsetHours ).toBeCloseTo( offsetHours, 10 );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_time_mismatch_banner_close',
			expect.objectContaining( {
				site_id: 321,
				dismissed_at: expect.any( String ),
			} )
		);
	} );

	test( 'does not render while dismiss is pending', () => {
		useSuspenseQuery.mockReturnValue( { data: null } );
		useMutation.mockReturnValue( { mutate: mutateMock, isPending: true } );
		const offsetHours = getOffsetHours();
		const { queryByRole } = render(
			<TimeMismatchNotice
				siteId={ 111 }
				siteTime={ offsetHours + 3 }
				settingsUrl="https://example.com"
			/>
		);
		expect( queryByRole( 'button', { name: /dismiss/i } ) ).toBeNull();
	} );
} );
