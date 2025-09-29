/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import MockDate from 'mockdate';
import { useFormattedTime } from '../index';

// Mock the useLocale hook to return a consistent locale
jest.mock( '../../../app/locale', () => ( {
	useLocale: () => 'en-US',
} ) );

function TestFormattedTime( {
	timestamp,
	formatOptions,
	timezoneString,
	gmtOffset,
}: {
	timestamp: string;
	formatOptions?: Intl.DateTimeFormatOptions;
	timezoneString?: string;
	gmtOffset?: number;
} ) {
	const formatted = useFormattedTime( timestamp, formatOptions, timezoneString, gmtOffset );
	return <span data-testid="formatted-time">{ formatted }</span>;
}

describe( 'useFormattedTime', () => {
	beforeEach( () => {
		// Freeze time at a known date for consistent testing
		MockDate.set( '2025-09-26T12:00:00Z' );
	} );

	afterEach( () => {
		MockDate.reset();
	} );

	test( 'formats date when dateStyle option is provided', () => {
		const timestamp = '2025-09-15T10:30:00Z';
		const formatOptions = { dateStyle: 'long' as const };

		render( <TestFormattedTime timestamp={ timestamp } formatOptions={ formatOptions } /> );

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /September 15, 2025/ );
	} );

	test( 'formats as "Today" when timestamp is same day as current date and no time style is provided', () => {
		// Use same date as MockDate (2025-09-26) but different time
		const timestamp = '2025-09-26T10:30:00Z';

		render( <TestFormattedTime timestamp={ timestamp } /> );

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /Today/ );
		expect( formattedElement ).not.toHaveTextContent( /Today at/ );
	} );

	test( 'formats as "Today" when timestamp is same day in site timezone without time style', () => {
		// Use same date as MockDate (2025-09-26) but different time
		const timestamp = '2025-09-26T20:00:00Z';
		const timezoneString = 'America/Los_Angeles';

		render( <TestFormattedTime timestamp={ timestamp } timezoneString={ timezoneString } /> );

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /Today/ );
		expect( formattedElement ).not.toHaveTextContent( /Today at/ );
	} );

	test( 'formats as "Today at" when timestamp is same day in site timezone and time style is provided', () => {
		// Use same date as MockDate (2025-09-26) but different time
		const timestamp = '2025-09-26T20:00:00Z';
		const timezoneString = 'America/Los_Angeles';
		const formatOptions = { timeStyle: 'short' as const };

		render(
			<TestFormattedTime
				timestamp={ timestamp }
				timezoneString={ timezoneString }
				formatOptions={ formatOptions }
			/>
		);

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /Today at 1:00 PM/ );
	} );

	test( 'formats as "Today at" when timestamp is same day using GMT offset', () => {
		// Use same date as MockDate (2025-09-26) but different time
		const timestamp = '2025-09-26T20:00:00Z';
		const gmtOffset = -3;
		const formatOptions = { timeStyle: 'short' as const };

		render(
			<TestFormattedTime
				timestamp={ timestamp }
				gmtOffset={ gmtOffset }
				formatOptions={ formatOptions }
			/>
		);

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /Today at 5:00 PM/ );
	} );

	test( 'formats date with timezone string using long date style', () => {
		const timestamp = '2025-09-15T14:30:00Z';
		const timezoneString = 'America/New_York'; // Should be 10:30 AM EDT (UTC-4 in August)
		const formatOptions = { timeStyle: 'short' as const };

		render(
			<TestFormattedTime
				timestamp={ timestamp }
				timezoneString={ timezoneString }
				formatOptions={ formatOptions }
			/>
		);

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /September 15, 2025/ );
		expect( formattedElement ).toHaveTextContent( /10:30 AM/ );
	} );

	test( 'formats date with positive timezone offset', () => {
		const timestamp = '2025-09-15T10:30:00Z';
		const timezoneString = 'Europe/Berlin'; // Should be 12:30 PM CEST (UTC+2 in September)
		const formatOptions = { timeStyle: 'short' as const };

		render(
			<TestFormattedTime
				timestamp={ timestamp }
				timezoneString={ timezoneString }
				formatOptions={ formatOptions }
			/>
		);

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /September 15, 2025/ );
		expect( formattedElement ).toHaveTextContent( /12:30 PM/ );
	} );

	test( 'formats date with negative GMT offset', () => {
		const timestamp = '2025-09-15T14:30:00Z';
		const gmtOffset = -5; // Should be 9:30 AM (UTC-5)
		const formatOptions = { timeStyle: 'short' as const };

		render(
			<TestFormattedTime
				timestamp={ timestamp }
				gmtOffset={ gmtOffset }
				formatOptions={ formatOptions }
			/>
		);

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /September 15, 2025/ );
		expect( formattedElement ).toHaveTextContent( /9:30 AM/ );
	} );

	test( 'formats date with positive GMT offset', () => {
		const timestamp = '2025-09-15T10:30:00Z';
		const gmtOffset = 3; // Should be 1:30 PM (UTC+3)
		const formatOptions = { timeStyle: 'short' as const };

		render(
			<TestFormattedTime
				timestamp={ timestamp }
				gmtOffset={ gmtOffset }
				formatOptions={ formatOptions }
			/>
		);

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /September 15, 2025/ );
		expect( formattedElement ).toHaveTextContent( /1:30 PM/ );
	} );

	test( 'prioritizes timezoneString over gmtOffset when both are provided', () => {
		const timestamp = '2025-09-15T14:30:00Z';
		const timezoneString = 'America/New_York'; // UTC-4 in September
		const gmtOffset = -8;
		const formatOptions = { timeStyle: 'short' as const };

		render(
			<TestFormattedTime
				timestamp={ timestamp }
				timezoneString={ timezoneString }
				gmtOffset={ gmtOffset }
				formatOptions={ formatOptions }
			/>
		);

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /September 15, 2025/ );
		// Should use timezoneString (New York time: 10:30 AM), not gmtOffset (6:30 AM)
		expect( formattedElement ).toHaveTextContent( /10:30 AM/ );
		expect( formattedElement ).not.toHaveTextContent( /6:30 AM/ );
	} );

	test( 'does not format as "Today" when timestamp is different day in site timezone', () => {
		const timestamp = '2025-09-26T01:00:00Z';
		const timezoneString = 'America/New_York';
		const formatOptions = { timeStyle: 'short' as const };

		render(
			<TestFormattedTime
				timestamp={ timestamp }
				timezoneString={ timezoneString }
				formatOptions={ formatOptions }
			/>
		);

		const formattedElement = screen.getByTestId( 'formatted-time' );
		expect( formattedElement ).toBeVisible();
		expect( formattedElement ).toHaveTextContent( /September 25, 2025/ );
		expect( formattedElement ).toHaveTextContent( /9:00 PM/ );
		expect( formattedElement ).not.toHaveTextContent( /Today/ );
	} );
} );
