import { fn } from '@storybook/test';
import { fr, ja, es, ko, pt, ar, it } from 'date-fns/locale';
import { useState } from 'react';
import { DateRangeCalendar } from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof DateRangeCalendar > = {
	title: 'Components/DateRangeCalendar',
	component: DateRangeCalendar,
	tags: [ 'autodocs' ],
	parameters: {
		controls: { expanded: true },
	},
	argTypes: {
		locale: {
			options: [ 'ar', 'es', 'fr', 'ja', 'ko', 'pt', 'it' ],
			mapping: {
				ar: ar,
				es: es,
				fr: fr,
				ja: ja,
				ko: ko,
				pt: pt,
				it: it,
			},
			control: {
				type: 'select',
			},
		},
		labels: {
			control: false,
		},
		defaultSelected: { control: { type: 'date' } },
		selected: { control: { type: 'date' } },
		onSelect: {
			control: false,
		},
		defaultMonth: { control: { type: 'date' } },
		month: { control: { type: 'date' } },
		onMonthChange: {
			control: false,
		},
		endMonth: { control: { type: 'date' } },
		startMonth: { control: { type: 'date' } },
		footer: { control: { type: 'text' } },
	},
	args: {
		onMonthChange: fn(),
		onSelect: fn(),
	},
};
export default meta;

type Story = StoryObj< typeof DateRangeCalendar >;

export const Default: Story = {};

export const Controlled: Story = {
	render: function ControlledTemplate( args ) {
		const [ range, setRange ] = useState< typeof args.selected >( {
			from: undefined,
			to: undefined,
		} );
		return (
			<DateRangeCalendar
				{ ...args }
				selected={ range }
				onSelect={ ( selectedDate, ...rest ) => {
					setRange( selectedDate );
					// TS is strict about `onSelect` expecting a non-undefined date
					// when the selection is required.
					if ( ! args.required ) {
						args.onSelect?.( selectedDate, ...rest );
					} else if ( selectedDate ) {
						args.onSelect?.( selectedDate, ...rest );
					}
				} }
			/>
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

const fullMonthYearFormatter = ( date: Date, locale: string ) =>
	new Intl.DateTimeFormat( locale, {
		month: 'long',
		year: 'numeric',
	} ).format( date );

const fullDateFormatter = ( date: Date, locale: string ) =>
	new Intl.DateTimeFormat( locale, {
		month: 'long',
		year: 'numeric',
		day: 'numeric',
		weekday: 'long',
	} ).format( date );

const weekdayFormatter = ( date: Date, locale: string ) =>
	new Intl.DateTimeFormat( locale, {
		weekday: 'long',
	} ).format( date );

export const Localized: Story = {
	args: {
		locale: it,
		dir: 'ltr',
		labels: {
			labelNav: () => 'Naviga tra i mesi',
			labelGrid: ( date ) => fullMonthYearFormatter( date, it.code ),
			labelGridcell: ( date, modifiers ) => {
				const formattedDate = fullDateFormatter( date, it.code );
				let label = formattedDate;
				if ( modifiers?.today ) {
					label = `Oggi, ${ formattedDate }`;
				}
				return label;
			},
			labelNext: ( month ) =>
				`Vai al prossimo mese, ${ month ? fullMonthYearFormatter( month, it.code ) : '' }`,
			labelPrevious: ( month ) =>
				`Vai al mese precedente, ${ month ? fullMonthYearFormatter( month, it.code ) : '' }`,
			labelDayButton: ( date, modifiers ) => {
				const formattedDate = fullDateFormatter( date, it.code );
				let label = formattedDate;
				if ( modifiers?.today ) {
					label = `Oggi, ${ formattedDate }`;
				}
				if ( modifiers?.selected ) {
					label = `${ formattedDate }, selezionato`;
				}
				return label;
			},
			labelWeekday: ( date ) => weekdayFormatter( date, it.code ),
		},
	},
};

/**
 * Since the footer is a live region, it is a great place to provide feedback
 * to the user about the selected date.
 */
export const Footer: Story = {
	render: function ControlledDateCalendar( args ) {
		const [ range, setRange ] = useState< typeof args.selected >( {
			from: undefined,
			to: undefined,
		} );

		let footerText;
		if ( ! range?.from ) {
			footerText = 'Please pick the first day.';
		} else if ( range.from && ! range.to ) {
			footerText = 'Now pick the last day.';
		} else if ( range.from && range.to ) {
			footerText = `You selected from ${ range.from.toLocaleDateString() } to ${ range.to.toLocaleDateString() }.`;
		}

		return (
			<DateRangeCalendar
				{ ...args }
				selected={ range }
				onSelect={ ( selectedDate, ...rest ) => {
					setRange( selectedDate );
					// TS is strict about `onSelect` expecting a non-undefined date
					// when the selection is required.
					if ( ! args.required ) {
						args.onSelect?.( selectedDate, ...rest );
					} else if ( selectedDate ) {
						args.onSelect?.( selectedDate, ...rest );
					}
				} }
				footer={ footerText }
			/>
		);
	},
};

const today = new Date();
const lastSevedDays = ( date: Date ) => {
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
		const [ range, setRange ] = useState< typeof args.selected >( {
			from: undefined,
			to: undefined,
		} );
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
							const targetRange = lastSevedDays( today );
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
						setRange( selectedDate );
						// TS is strict about `onSelect` expecting a non-undefined date
						// when the selection is required.
						if ( ! args.required ) {
							args.onSelect?.( selectedDate, ...rest );
						} else if ( selectedDate ) {
							args.onSelect?.( selectedDate, ...rest );
						}
					} }
					month={ month }
					onMonthChange={ setMonth }
				/>
			</>
		);
	},
};
