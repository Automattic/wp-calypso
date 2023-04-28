/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render } from '@testing-library/react';
import * as reactRedux from 'react-redux';
import TrackResurrections from '../';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn( () => ( {
		type: 'ANALYTICS_EVENT_RECORD',
	} ) ),
} ) );

const useSelectorMock = reactRedux.useSelector;

let mockStore = {};

describe( 'TrackResurrections', () => {
	beforeEach( () => {
		useSelectorMock.mockImplementation( ( selector ) => selector( mockStore ) );
	} );

	afterEach( () => {
		useSelectorMock.mockClear();
		jest.clearAllMocks();
	} );

	it( 'should not call recordTracksEvent if fetching', () => {
		mockStore = {
			userSettings: {
				fetching: true,
			},
		};

		render( <TrackResurrections /> );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'should not call recordTracksEvent if lastSeen is less than one year ago', () => {
		const resurrectedDate = Date.now() / 1000 - 2 * 30 * 24 * 60 * 60; // 2 months-ish.
		mockStore = {
			userSettings: {
				settings: {
					last_admin_activity_timestamp: resurrectedDate,
				},
				fetching: false,
			},
		};

		render( <TrackResurrections /> );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'should call recordTracksEvent if lastSeen is more than one year ago', () => {
		const resurrectedDate = Date.now() / 1000 - 2 * 365 * 24 * 60 * 60; // 2 years in seconds.
		mockStore = {
			userSettings: {
				settings: {
					last_admin_activity_timestamp: resurrectedDate,
				},
				fetching: false,
			},
		};

		render( <TrackResurrections /> );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_user_resurrected', {
			last_seen: resurrectedDate,
		} );
	} );
} );
