/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
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

	it( 'should not call recordTracksEvent if lastSeen is less than one year ago', () => {
		const resurrectedDate = Date.now() / 1000 - 2 * 30 * 24 * 60 * 60; // 2 months-ish.

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

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'should call recordTracksEvent if lastSeen is more than one year ago', () => {
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

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_user_resurrected',
			expect.objectContaining( {
				last_seen: resurrectedDate,
			} )
		);
	} );
} );
