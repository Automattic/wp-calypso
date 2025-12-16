/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { RESURRECTED_EVENT, RESURRECTED_EVENT_6M } from 'calypso/lib/resurrected-users/constants';
import userSettings from 'calypso/state/user-settings/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import TrackResurrections from '../';

function render( el, options ) {
	return renderWithProvider( el, {
		...options,
		reducers: {
			userSettings,
		},
	} );
}

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn( () => ( {
		type: 'ANALYTICS_EVENT_RECORD',
	} ) ),
} ) );

describe( 'TrackResurrections', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should not call recordTracksEvent if fetching', () => {
		render( <TrackResurrections />, {
			initialState: {
				userSettings: {
					settings: {},
					fetching: true,
				},
			},
		} );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'should not call recordTracksEvent if lastSeen is less than six months ago', () => {
		const dormantThreshold = Date.now() / 1000 - 2 * 30 * 24 * 60 * 60; // 2 months-ish.

		render( <TrackResurrections />, {
			initialState: {
				userSettings: {
					settings: {
						last_admin_activity_timestamp: dormantThreshold,
					},
					fetching: false,
				},
			},
		} );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'should call both resurrection events if lastSeen is more than one year ago', () => {
		const resurrectedDate = Date.now() / 1000 - 2 * 365 * 24 * 60 * 60; // 2 years in seconds.

		render( <TrackResurrections />, {
			initialState: {
				userSettings: {
					settings: {
						last_admin_activity_timestamp: resurrectedDate,
					},
					fetching: false,
				},
			},
		} );

		expect( recordTracksEvent ).toHaveBeenNthCalledWith(
			1,
			RESURRECTED_EVENT,
			expect.objectContaining( {
				last_seen: resurrectedDate,
			} )
		);
		expect( recordTracksEvent ).toHaveBeenNthCalledWith(
			2,
			RESURRECTED_EVENT_6M,
			expect.objectContaining( {
				last_seen: resurrectedDate,
			} )
		);
	} );

	it( 'should call only the six month resurrection event if lastSeen is between six and twelve months ago', () => {
		const resurrectedDate = Date.now() / 1000 - 8 * 30 * 24 * 60 * 60; // ~8 months.

		render( <TrackResurrections />, {
			initialState: {
				userSettings: {
					settings: {
						last_admin_activity_timestamp: resurrectedDate,
					},
					fetching: false,
				},
			},
		} );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			RESURRECTED_EVENT_6M,
			expect.objectContaining( {
				last_seen: resurrectedDate,
			} )
		);
	} );
} );
