const mockUseSelector = ( func ) => func();
const mockUseMemo = ( func ) => func();

jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useMemo: jest.fn( ( fn ) => fn ),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/backup/hooks', () => ( {
	...jest.requireActual( 'calypso/my-sites/backup/hooks' ),
	useMatchingBackupAttemptsInRange: jest.fn(),
} ) );
jest.mock( 'calypso/components/localized-moment' );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );

import moment from 'moment';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useMatchingBackupAttemptsInRange } from 'calypso/my-sites/backup/hooks';
import { useDatesWithNoSuccessfulBackups } from 'calypso/my-sites/backup/status/hooks';

describe( 'useDatesWithNoSuccessfulBackups', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		useMemo.mockImplementation( mockUseMemo );
		useSelector.mockImplementation( mockUseSelector );
		useLocalizedMoment.mockImplementation( () => moment );
		useMatchingBackupAttemptsInRange.mockImplementation( () => {
			return {
				isLoading: false,
				backups: [
					{ activityDate: '2021-12-01', activityIsRewindable: true },
					{ activityDate: '2021-12-04', activityIsRewindable: true },
					{ activityDate: '2021-12-05', activityIsRewindable: false },
				],
			};
		} );
	} );

	test( 'Dates with backups are correctly excluded from range of dates', () => {
		const start = moment( '2021-12-01' );
		const end = moment( '2021-12-05' );

		const { isLoading, dates } = useDatesWithNoSuccessfulBackups( null, start, end );

		expect( dates ).toEqual( [ '12-02-2021', '12-03-2021', '12-05-2021' ] );
		expect( isLoading ).toBeFalsy();
	} );
} );
