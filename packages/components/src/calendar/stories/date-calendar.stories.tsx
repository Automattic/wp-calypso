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
import { DateCalendar, TZDate } from '../index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof DateCalendar > = {
	title: 'Components/DateCalendar',
	component: DateCalendar,
	parameters: {
		controls: { expanded: true },
	},
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
		defaultSelected: { control: 'date' },
		selected: { control: 'date' },
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

type Story = StoryObj< typeof DateCalendar >;

export const Default: Story = {};

function dateToInputValue( date: Date ) {
	return `${ date.getFullYear() }-${ ( date.getMonth() + 1 ).toString().padStart( 2, '0' ) }-${ date
		.getDate()
		.toString()
		.padStart( 2, '0' ) }`;
}

/**
 * The component can be used in controlled mode. This is useful, for example,
 * when in need of keeping the component in sync with an external input field.
 *
 * _Note: this example doesn't handle time zones_
 */
export const ControlledWithInputField: Story = {
	render: function ControlledDateCalendar( args ) {
		const [ selected, setSelected ] = useState< Date | null >( null );

		return (
			<div style={ { display: 'flex', flexDirection: 'column', gap: 16 } }>
				<label style={ { display: 'flex', flexDirection: 'column', gap: 4 } }>
					Selected date
					<input
						type="date"
						value={
							// Note: the following code doesn't handle time zones.
							selected ? dateToInputValue( selected ) : ''
						}
						onChange={ ( e ) => {
							// Note: the following code doesn't handle time zones.
							setSelected( new Date( e.target.value ) );
						} }
						style={ { width: 160 } }
					/>
				</label>
				<DateCalendar
					{ ...args }
					selected={ selected }
					onSelect={ ( selectedDate, ...rest ) => {
						setSelected( selectedDate ?? null );
						args.onSelect?.( selectedDate, ...rest );
					} }
				/>
			</div>
		);
	},
	argTypes: {
		defaultSelected: {
			control: false,
		},
		selected: {
			control: false,
		},
		timeZone: {
			control: false,
		},
	},
};

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
export const WithSelectedDateAndMonth: Story = {
	args: {
		defaultSelected: firstDayOfNextMonth,
		defaultMonth: firstDayOfNextMonth,
	},
};

export const WithTimeZone: Story = {
	render: function DateCalendarWithTimeZone( args ) {
		const [ selected, setSelected ] = useState< TZDate | null >( null );

		useEffect( () => {
			setSelected(
				// Select one week from today every time the time zone changes.
				new TZDate( new Date().setDate( new Date().getDate() + 7 ), args.timeZone )
			);
		}, [ args.timeZone ] );

		return (
			<>
				<DateCalendar
					{ ...args }
					selected={ selected }
					onSelect={ ( selectedDate, ...rest ) => {
						setSelected( selectedDate ? new TZDate( selectedDate, args.timeZone ) : null );
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
					before today, and starting with a default date of 1 week from today`
				</p>
			</>
		);
	},
	args: {
		timeZone: 'Pacific/Auckland',
	},
	argTypes: {
		selected: {
			control: false,
		},
		defaultSelected: {
			control: false,
		},
		disabled: {
			control: false,
		},
	},
};

const today = new Date();
const oneWeekBefore = ( date: Date ) => {
	const toReturn = new Date( date );
	toReturn.setDate( date.getDate() - 7 );
	return toReturn;
};
const startOfMonth = ( date: Date ) => new Date( date.getFullYear(), date.getMonth(), 1 );
const oneMonthBefore = ( date: Date ) => {
	const toReturn = new Date( date );
	toReturn.setMonth( date.getMonth() - 1 );
	return toReturn;
};
const startOfYear = ( date: Date ) => new Date( date.getFullYear(), 0, 1 );
const oneYearBefore = ( date: Date ) => {
	const toReturn = new Date( date );
	toReturn.setFullYear( date.getFullYear() - 1 );
	return toReturn;
};

export const WithPresets: Story = {
	render: function ControlledDateCalendar( args ) {
		const [ selected, setSelected ] = useState< Date | null >( null );
		const [ month, setMonth ] = useState< Date >();

		return (
			<>
				<div style={ { display: 'flex', gap: 8, marginBottom: 16 } }>
					<button
						type="button"
						onClick={ () => {
							setSelected( today );
							setMonth( today );
						} }
					>
						Today
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetDate = oneWeekBefore( today );
							setSelected( targetDate );
							setMonth( targetDate );
						} }
					>
						One week ago
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetDate = startOfMonth( today );
							setSelected( targetDate );
							setMonth( targetDate );
						} }
					>
						Start of this month
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetDate = oneMonthBefore( today );
							setSelected( targetDate );
							setMonth( targetDate );
						} }
					>
						One month ago
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetDate = startOfYear( today );
							setSelected( targetDate );
							setMonth( targetDate );
						} }
					>
						Start of the year
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetDate = oneYearBefore( today );
							setSelected( targetDate );
							setMonth( targetDate );
						} }
					>
						One year ago
					</button>
				</div>
				<DateCalendar
					{ ...args }
					selected={ selected }
					onSelect={ ( selectedDate, ...rest ) => {
						setSelected( selectedDate ?? null );
						args.onSelect?.( selectedDate, ...rest );
					} }
					month={ month }
					onMonthChange={ setMonth }
				/>
			</>
		);
	},
	argTypes: {
		selected: {
			control: false,
		},
		defaultSelected: {
			control: false,
		},
	},
};
