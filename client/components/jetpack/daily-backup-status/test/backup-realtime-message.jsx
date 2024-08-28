/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { BackupRealtimeMessage } from '../status-card/backup-realtime-message';

// Mock the useTranslate function
jest.mock( 'i18n-calypso' );

describe( 'BackupRealtimeMessage', () => {
	const renderMessage = ( baseBackupDate, eventsCount, selectedDate ) => {
		return render(
			<BackupRealtimeMessage
				baseBackupDate={ baseBackupDate }
				eventsCount={ eventsCount }
				selectedBackupDate={ selectedDate }
			/>
		);
	};

	const translateMock = jest.fn( ( singular, plural, { count, args } ) => {
		const translatedText = count === 1 ? singular : plural;
		return translatedText
			.replace( '%(baseBackupDate)s', args.baseBackupDate )
			.replace( '%(eventsCount)d', args.eventsCount )
			.replace( '%(daysAgo)d', args.daysAgo );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		useTranslate.mockImplementation( () => translateMock );
	} );

	test( "renders correct message for today's backup", () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = selectedDate; // same day
		const { container } = renderMessage( baseBackupDate, 3, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a full backup from this day (2024-08-26 12:00 PM) with 3 changes you have made since then until now.`
		);
	} );

	test( "renders correct message for yesterday's backup", () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = selectedDate.clone().subtract( 1, 'day' ); // previous day
		const { container } = renderMessage( baseBackupDate, 25, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a full backup from the previous day (2024-08-25 12:00 PM) with 25 changes you have made since then until now.`
		);
	} );

	test( 'renders correct message for a backup less than 7 days old', () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = moment( '2024-08-23T12:00:00Z' );
		const { container } = renderMessage( baseBackupDate, 5, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a 3-day old full backup (2024-08-23 12:00 PM) with 5 changes you have made since then until now.`
		);
	} );

	test( 'renders correct singular message', () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = moment( '2024-08-26T12:00:00Z' );
		const { container } = renderMessage( baseBackupDate, 1, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a full backup from this day (2024-08-26 12:00 PM) with 1 change you have made since then until now.`
		);
	} );

	test( 'renders correct plural message', () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = moment( '2024-08-26T12:00:00Z' );
		const { container } = renderMessage( baseBackupDate, 2, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a full backup from this day (2024-08-26 12:00 PM) with 2 changes you have made since then until now.`
		);
	} );
} );
