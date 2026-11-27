import moment from 'moment';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { vi } from 'vitest';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useMatchingBackupAttemptsInRange } from 'calypso/my-sites/backup/hooks';
import { useDatesWithNoSuccessfulBackups } from 'calypso/my-sites/backup/status/hooks';

const mockUseSelector = ( func ) => func();
const mockUseMemo = ( func ) => func();

vi.mock( 'react', async () => ( {
	...( await vi.importActual( 'react' ) ),
	useMemo: vi.fn( ( fn ) => fn ),
} ) );
vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual( 'react-redux' ) ),
	useSelector: vi.fn(),
} ) );
vi.mock( 'calypso/my-sites/backup/hooks', async () => ( {
	...( await vi.importActual( 'calypso/my-sites/backup/hooks' ) ),
	useMatchingBackupAttemptsInRange: vi.fn(),
} ) );
vi.mock( 'calypso/components/localized-moment' );
vi.mock( 'calypso/state/selectors/get-site-gmt-offset' );
vi.mock( 'calypso/state/selectors/get-site-timezone-value' );

describe( 'useDatesWithNoSuccessfulBackups', () => {
	beforeEach( () => {
		vi.clearAllMocks();

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
