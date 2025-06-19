import { fn } from '@storybook/test';
import {
	enUS,
	fr,
	es,
	de,
	it,
	he,
	ru,
	ja,
	ptBR,
	nl,
	ko,
	tr,
	id,
	zhCN,
	zhTW,
	ar,
	sv,
} from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { DateRangeCalendar, TZDate } from '../';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof DateRangeCalendar > = {
	title: 'UI/DateRangeCalendar',
	component: DateRangeCalendar,
	argTypes: {
		locale: {
			options: [
				'English (US)',
				'French',
				'Spanish',
				'German',
				'Italian',
				'Hebrew',
				'Russian',
				'Japanese',
				'Portuguese (Brazil)',
				'Dutch',
				'Korean',
				'Turkish',
				'Indonesian',
				'Chinese (Simplified)',
				'Chinese (Traditional)',
				'Arabic',
				'Swedish',
			],
			mapping: {
				'English (US)': enUS,
				French: fr,
				Spanish: es,
				German: de,
				Italian: it,
				Hebrew: he,
				Russian: ru,
				Japanese: ja,
				'Portuguese (Brazil)': ptBR,
				Dutch: nl,
				Korean: ko,
				Turkish: tr,
				Indonesian: id,
				'Chinese (Simplified)': zhCN,
				'Chinese (Traditional)': zhTW,
				Arabic: ar,
				Swedish: sv,
			},
			control: 'select',
		},
		timeZone: {
			options: [
				'Pacific/Honolulu',
				'America/New_York',
				'Europe/London',
				'Asia/Tokyo',
				'Pacific/Auckland',
			],
			control: 'select',
		},
		labels: {
			control: false,
		},
		defaultSelected: { control: false },
		selected: { control: false },
		onSelect: {
			control: false,
		},
		defaultMonth: { control: 'date' },
		month: { control: 'date' },
		onMonthChange: {
			control: false,
		},
		endMonth: { control: 'date' },
		startMonth: { control: 'date' },
	},
	args: {
		onMonthChange: fn(),
		onSelect: fn(),
	},
};
export default meta;

type Story = StoryObj< typeof DateRangeCalendar >;

export const Default: Story = {};

export const DisabledDates: Story = {
	args: {
		disabled: [
			// Disable tomorrow (single date)
			new Date( new Date().setDate( new Date().getDate() + 1 ) ),
			// Disable all dates after Feb 1st of next year
			{ after: new Date( new Date().getFullYear() + 1, 1, 1 ) },
			// Disable all dates before Dec 1st of last year
			{ before: new Date( new Date().getFullYear() - 1, 11, 1 ) },
			// Disable all dates between 12th and 14th of August of this year
			{
				after: new Date( new Date().getFullYear(), 7, 11 ),
				before: new Date( new Date().getFullYear(), 7, 15 ),
			},
			// Disable all dates between 21st and 26th of October of this year
			{
				from: new Date( new Date().getFullYear(), 9, 21 ),
				to: new Date( new Date().getFullYear(), 9, 26 ),
			},
			// Disable all Wednesdays
			{ dayOfWeek: 3 },
			// Disable all prime day numbers
			function isPrimeDate( date: Date ) {
				return [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 ].includes( date.getDate() );
			},
		],
	},
};

const nextMonth = new Date().getMonth() === 11 ? 0 : new Date().getMonth() + 1;
const nextMonthYear =
	new Date().getMonth() === 11 ? new Date().getFullYear() + 1 : new Date().getFullYear();
const firstDayOfNextMonth = new Date( nextMonthYear, nextMonth, 1 );
const fourthDayOfNextMonth = new Date( nextMonthYear, nextMonth, 4 );
export const WithSelectedRangeAndMonth: Story = {
	args: {
		defaultSelected: { from: firstDayOfNextMonth, to: fourthDayOfNextMonth },
		defaultMonth: firstDayOfNextMonth,
	},
};

/**
 * When working with time zones, use the `TZDate` object exported by this package instead of the native `Date` object.
 */
export const WithTimeZone: Story = {
	render: function DateCalendarWithTimeZone( args ) {
		const [ range, setRange ] = useState< typeof args.selected | null >( null );

		useEffect( () => {
			setRange(
				// Select from one week from today to two weeks from today
				// every time the timezone changes.
				{
					from: new TZDate( new Date().setDate( new Date().getDate() + 7 ), args.timeZone ),
					to: new TZDate( new Date().setDate( new Date().getDate() + 14 ), args.timeZone ),
				}
			);
		}, [ args.timeZone ] );

		return (
			<>
				<DateRangeCalendar
					{ ...args }
					selected={ range }
					onSelect={ ( selectedDate, ...rest ) => {
						setRange(
							// Set controlled state to null if there's no selection
							! selectedDate || ( selectedDate.from === undefined && selectedDate.to === undefined )
								? null
								: selectedDate
						);
						args.onSelect?.( selectedDate, ...rest );
					} }
					disabled={ [
						{
							// Disable any date before today
							before: new TZDate( new Date(), args.timeZone ),
						},
					] }
				/>
				<p>
					Calendar set to { args.timeZone ?? 'current' } timezone, disabling selection for all dates
					before today, and starting with a default date range of 1 week from today to 2 weeks from
					today.
				</p>
			</>
		);
	},
	args: {
		timeZone: 'Pacific/Auckland',
	},
	argTypes: {
		disabled: {
			control: false,
		},
	},
};
