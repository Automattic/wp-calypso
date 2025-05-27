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
import { DateRangeCalendar, TZDate } from '../index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof DateRangeCalendar > = {
	title: 'Components/DateRangeCalendar',
	component: DateRangeCalendar,
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

function dateToInputValue( date: Date ) {
	return `${ date.getFullYear() }-${ ( date.getMonth() + 1 ).toString().padStart( 2, '0' ) }-${ date
		.getDate()
		.toString()
		.padStart( 2, '0' ) }`;
}

/**
 * The component can be used in controlled mode. This is useful, for example,
 * when in need of keeping the component in sync with external input fields.
 *
 * _Note: this example doesn't handle time zones_
 */
export const ControlledWithInputFields: Story = {
	render: function ControlledTemplate( args ) {
		const [ range, setRange ] = useState< typeof args.selected | null >( null );
		return (
			<div style={ { display: 'flex', flexDirection: 'column', gap: 16 } }>
				<label style={ { display: 'flex', flexDirection: 'column', gap: 4 } }>
					Start date
					<input
						type="date"
						value={
							// Note: the following code doesn't handle time zones.
							range?.from ? dateToInputValue( range.from ) : ''
						}
						onChange={ ( e ) => {
							// Note: the following code doesn't handle time zones.
							setRange( {
								to: new Date( e.target.value ),
								...range,
								from: new Date( e.target.value ),
							} );
						} }
						style={ { width: 160 } }
					/>
				</label>
				<label style={ { display: 'flex', flexDirection: 'column', gap: 4 } }>
					End date
					<input
						type="date"
						value={
							// Note: the following code doesn't handle time zones.
							range?.to ? dateToInputValue( range.to ) : ''
						}
						onChange={ ( e ) => {
							// Note: the following code doesn't handle time zones.
							setRange( {
								from: new Date( e.target.value ),
								...range,
								to: new Date( e.target.value ),
							} );
						} }
						style={ { width: 160 } }
					/>
				</label>
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
				/>
			</div>
		);
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
const fourthDayOfNextMonth = new Date( nextMonthYear, nextMonth, 4 );
export const WithSelectedRangeAndMonth: Story = {
	args: {
		defaultSelected: { from: firstDayOfNextMonth, to: fourthDayOfNextMonth },
		defaultMonth: firstDayOfNextMonth,
	},
};

export const WithTimeZone: Story = {
	render: function DateCalendarWithTimeZone( args ) {
		const [ range, setRange ] = useState< typeof args.selected | null >( null );

		useEffect( () => {
			setRange(
				// Select from one week from today to two weeks from today 	every time the time zone changes.
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
					before today, and starting with a default date of 1 week from today`
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

const today = new Date();
const lastSevenDays = ( date: Date ) => {
	const toReturn = new Date( date );
	toReturn.setDate( date.getDate() - 6 );
	return {
		from: toReturn,
		to: date,
	};
};
const monthToDate = ( date: Date ) => ( {
	from: new Date( date.getFullYear(), date.getMonth(), 1 ),
	to: date,
} );
const lastThirtyDays = ( date: Date ) => {
	const toReturn = new Date( date );
	toReturn.setDate( date.getDate() - 29 );
	return {
		from: toReturn,
		to: date,
	};
};
const yearToDate = ( date: Date ) => ( {
	from: new Date( date.getFullYear(), 0, 1 ),
	to: date,
} );
const lastTwelveMonths = ( date: Date ) => {
	const toReturn = new Date( date );
	toReturn.setFullYear( date.getFullYear() - 1 );
	toReturn.setDate( date.getDate() + 1 );
	return {
		from: toReturn,
		to: date,
	};
};

export const WithPresets: Story = {
	render: function ControlledDateCalendar( args ) {
		const [ range, setRange ] = useState< typeof args.selected | null >( null );
		const [ month, setMonth ] = useState< Date >();

		return (
			<>
				<div style={ { display: 'flex', gap: 8, marginBottom: 16 } }>
					<button
						type="button"
						onClick={ () => {
							setRange( { from: today, to: today } );
							setMonth( today );
						} }
					>
						Today
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetRange = lastSevenDays( today );
							setRange( targetRange );
							setMonth( targetRange.to );
						} }
					>
						Last 7 days
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetRange = lastThirtyDays( today );
							setRange( targetRange );
							setMonth( targetRange.to );
						} }
					>
						Last 30 days
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetRange = monthToDate( today );
							setRange( targetRange );
							setMonth( targetRange.to );
						} }
					>
						Month to date
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetRange = lastTwelveMonths( today );
							setRange( targetRange );
							setMonth( targetRange.to );
						} }
					>
						Last 12 months
					</button>
					<button
						type="button"
						onClick={ () => {
							const targetRange = yearToDate( today );
							setRange( targetRange );
							setMonth( targetRange.to );
						} }
					>
						Year to date
					</button>
				</div>
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
					month={ month }
					onMonthChange={ setMonth }
				/>
			</>
		);
	},
};
