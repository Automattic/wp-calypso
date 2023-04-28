/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import TrackResurrections from './TrackResurrections';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/get-user-settings', () => jest.fn() );

jest.mock( 'calypso/state/user-settings/selectors', () => ( {
	isFetchingUserSettings: jest.fn(),
} ) );

describe( 'TrackResurrections', () => {
	const userSettings = {
		last_admin_activity_timestamp: Date.now() - 2 * 365 * 24 * 60 * 60 * 1000,
	};

	beforeEach( () => {
		useSelector.mockReturnValue( userSettings );
	} );

	afterEach( () => {
		useSelector.mockClear();
		jest.clearAllMocks();
	} );

	it( 'should not call recordTracksEvent if isFetching is true', () => {
		useSelector.mockReturnValueOnce( { ...userSettings, isFetchingUserSettings: true } );

		act( () => {
			render( <TrackResurrections /> );
		} );

		expect( useSelector ).toHaveBeenCalledWith( expect.any( Function ) );
		expect( useSelector ).toHaveBeenCalledTimes( 2 );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'should not call recordTracksEvent if lastSeen is within one year', () => {
		act( () => {
			render( <TrackResurrections /> );
		} );

		expect( useSelector ).toHaveBeenCalledWith( expect.any( Function ) );
		expect( useSelector ).toHaveBeenCalledTimes( 2 );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'should call recordTracksEvent if lastSeen is more than one year ago', () => {
		const last_admin_activity_timestamp = Date.now() - 3 * 365 * 24 * 60 * 60 * 1000;
		useSelector.mockReturnValueOnce( {
			...userSettings,
			last_admin_activity_timestamp,
		} );

		act( () => {
			render( <TrackResurrections /> );
		} );

		expect( useSelector ).toHaveBeenCalledWith( expect.any( Function ) );
		expect( useSelector ).toHaveBeenCalledTimes( 2 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_user_resurrected', {
			last_seen: last_admin_activity_timestamp,
		} );
	} );
} );
