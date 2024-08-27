/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { BackupRealtimeMessage } from '../status-card/backup-realtime-message';

// Mock the useTranslate function
jest.mock( 'i18n-calypso' );

// Mock the useLocalizedMoment hook
jest.mock( 'calypso/components/localized-moment' );

describe( 'BackupRealtimeMessage', () => {
	const fixedDate = '2024-08-26T12:00:00Z'; // Fixed date to use as "today"

	const renderMessage = ( backupDate, eventsCount ) => {
		return render(
			<BackupRealtimeMessage
				backupDate={ new Date( backupDate ).getTime() }
				eventsCount={ eventsCount }
			/>
		);
	};

	const translateMock = jest.fn( ( singular, plural, { count, args } ) => {
		const translatedText = count === 1 ? singular : plural;
		return translatedText
			.replace( '%(backupDate)s', args.backupDate )
			.replace( '%(eventsCount)d', args.eventsCount )
			.replace( '%(daysAgo)d', args.daysAgo );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		useTranslate.mockImplementation( () => translateMock );

		// Mock useLocalizedMoment to return a fixed moment instance
		useLocalizedMoment.mockImplementation( () => {
			const moment = jest.requireActual( 'moment' );
			return ( input ) => {
				return input ? moment( input ) : moment( fixedDate );
			};
		} );
	} );

	test( "renders correct message for today's backup", () => {
		const { container } = renderMessage( '2024-08-26T12:00:00Z', 3 );
		expect( container.textContent ).toBe(
			`We are using the full backup from today (2024-08-26 12:00 PM) with 3 changes you have made since then until now.`
		);
	} );

	test( "renders correct message for yesterday's backup", () => {
		const { container } = renderMessage( '2024-08-25T12:00:00Z', 25 );
		expect( container.textContent ).toBe(
			`We are using the full backup from yesterday (2024-08-25 12:00 PM) with 25 changes you have made since then until now.`
		);
	} );

	test( 'renders correct message for a backup less than 7 days old', () => {
		const { container } = renderMessage( '2024-08-23T12:00:00Z', 5 );
		expect( container.textContent ).toBe(
			`We are using a 3-day old full backup (2024-08-23 12:00 PM) with 5 changes you have made since then until now.`
		);
	} );

	test( 'renders correct singular message', () => {
		const { container } = renderMessage( '2024-08-26T12:00:00Z', 1 );
		expect( container.textContent ).toBe(
			`We are using the full backup from today (2024-08-26 12:00 PM) with 1 change you have made since then until now.`
		);
	} );

	test( 'renders correct plural message', () => {
		const { container } = renderMessage( '2024-08-26T12:00:00Z', 2 );
		expect( container.textContent ).toBe(
			`We are using the full backup from today (2024-08-26 12:00 PM) with 2 changes you have made since then until now.`
		);
	} );
} );
