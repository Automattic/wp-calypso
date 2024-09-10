/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useDispatch } from 'calypso/state';
import { BackupRealtimeMessage } from '../status-card/backup-realtime-message';

jest.mock( 'i18n-calypso' ); // Mock the useTranslate hook
jest.mock( 'calypso/state' ); // Mock the useDispatch hook

describe( 'BackupRealtimeMessage', () => {
	const renderMessage = ( baseBackupDate, eventsCount, selectedDate, learnMoreUrl ) => {
		return render(
			<BackupRealtimeMessage
				baseBackupDate={ baseBackupDate }
				eventsCount={ eventsCount }
				selectedBackupDate={ selectedDate }
				learnMoreUrl={ learnMoreUrl } // Optional `Learn more` link
			/>
		);
	};

	const translateMock = jest.fn( ( singular, plural, options ) => {
		if ( options === undefined ) {
			return singular;
		}

		const translatedText = options.count === 1 ? singular : plural;
		return translatedText
			.replace( '%(baseBackupDate)s', options.args.baseBackupDate )
			.replace( '%(eventsCount)d', options.args.eventsCount )
			.replace( '%(daysAgo)d', options.args.daysAgo );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		useTranslate.mockImplementation( () => translateMock );
		useDispatch.mockImplementation( () => jest.fn() );
	} );

	test( 'renders the correct message when backup date and selected date are today', () => {
		const today = moment();
		const formattedDate = today.format( 'YYYY-MM-DD hh:mm A' );
		const { container } = renderMessage( today, 3, today );
		expect( container.textContent ).toBe(
			`We are using a full backup from today (${ formattedDate }) with 3 changes you have made since then until now.`
		);
	} );

	test( 'renders the correct message when backup date is yesterday and selected date is today', () => {
		const today = moment(); // today
		const yesterday = moment().subtract( 1, 'days' ); // yesterday
		const formattedDate = yesterday.format( 'YYYY-MM-DD hh:mm A' ); // formatted backup date

		const { container } = renderMessage( yesterday, 5, today );
		expect( container.textContent ).toBe(
			`We are using a full backup from yesterday (${ formattedDate }) with 5 changes you have made since then until now.`
		);
	} );

	test( 'renders the correct message when the base backup date is the same as the selected backup date', () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = selectedDate; // same day
		const { container } = renderMessage( baseBackupDate, 3, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a full backup from this day (2024-08-26 12:00 PM) with 3 changes you have made since then until now.`
		);
	} );

	test( 'renders the correct message when the base backup date is the day before the selected backup date', () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = selectedDate.clone().subtract( 1, 'day' ); // previous day
		const { container } = renderMessage( baseBackupDate, 25, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a full backup from the previous day (2024-08-25 12:00 PM) with 25 changes you have made since then until now.`
		);
	} );

	test( 'renders the correct message when the base backup date is two or more days before the selected backup date', () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = moment( '2024-08-23T12:00:00Z' );
		const { container } = renderMessage( baseBackupDate, 5, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a 3-day old full backup (2024-08-23 12:00 PM) with 5 changes you have made since then until now.`
		);
	} );

	test( 'renders the correct singular message when there is only 1 change', () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = moment( '2024-08-26T12:00:00Z' );
		const { container } = renderMessage( baseBackupDate, 1, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a full backup from this day (2024-08-26 12:00 PM) with 1 change you have made since then until now.`
		);
	} );

	test( 'renders the correct plural message when there are 2 or more changes', () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = moment( '2024-08-26T12:00:00Z' );
		const { container } = renderMessage( baseBackupDate, 2, selectedDate );
		expect( container.textContent ).toBe(
			`We are using a full backup from this day (2024-08-26 12:00 PM) with 2 changes you have made since then until now.`
		);
	} );

	test( 'renders the correct message and the "Learn more" link when learnMoreUrl is provided', () => {
		const selectedDate = moment( '2024-08-26T12:00:00Z' );
		const baseBackupDate = moment( '2024-08-26T12:00:00Z' );
		const learnMoreUrl = '/learn-more';

		const { container, getByText } = renderMessage( baseBackupDate, 3, selectedDate, learnMoreUrl );

		// Verify the message content
		expect( container.textContent ).toContain(
			'We are using a full backup from this day (2024-08-26 12:00 PM) with 3 changes you have made since then until now.'
		);

		// Verify the `Learn more` link is rendered
		const learnMoreLink = getByText( 'Learn more' );
		expect( learnMoreLink ).toBeInTheDocument();
		expect( learnMoreLink.getAttribute( 'href' ) ).toBe( learnMoreUrl );
	} );
} );
