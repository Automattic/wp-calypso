jest.mock( 'calypso/my-sites/backup/hooks', () => ( {
	...jest.requireActual( 'calypso/my-sites/backup/hooks' ),
	useMatchingBackupAttemptsInRange: jest.fn(),
} ) );
jest.mock( 'calypso/components/localized-moment' );

import moment from 'moment';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useMatchingBackupAttemptsInRange } from 'calypso/my-sites/backup/hooks';
import { useDatesWithNoSuccessfulBackups } from 'calypso/my-sites/backup/status/hooks';

describe( 'useDatesWithNoSuccessfulBackups', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		useLocalizedMoment.mockImplementation( () => moment );
		useMatchingBackupAttemptsInRange.mockImplementation( () => {
			return { isLoading: false, backups: [ '12-01-2021', '12-04-2021' ] };
		} );
	} );

	test( 'Dates with backups are correctly excluded from range of dates', () => {
		const start = moment( '12-01-2021' );
		const end = moment( '12-05-2021' );

		const { isLoading, dates } = useDatesWithNoSuccessfulBackups( null, start, end );

		expect( dates ).toEqual( [ '12-02-2021', '12-03-2021', '12-05-2021' ] );
		expect( isLoading ).toBeFalsy();
	} );
} );
