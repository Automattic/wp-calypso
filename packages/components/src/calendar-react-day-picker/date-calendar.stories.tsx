import { fn } from '@storybook/test';
import { fr, ja, es, ko, pt, ar } from 'date-fns/locale';
import { DateCalendar } from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof DateCalendar > = {
	title: 'Components/DateCalendar',
	component: DateCalendar,
	tags: [ 'autodocs' ],
	parameters: {
		controls: { expanded: true },
	},
	argTypes: {
		locale: {
			options: [ 'ar', 'es', 'fr', 'ja', 'ko', 'pt' ],
			mapping: {
				ar: ar,
				es: es,
				fr: fr,
				ja: ja,
				ko: ko,
				pt: pt,
			},
			control: {
				type: 'select',
			},
		},
		labels: {
			control: false,
		},
		onMonthChange: {
			control: false,
		},
		onSelect: {
			control: false,
		},
		defaultMonth: { control: { type: 'date' } },
		month: { control: { type: 'date' } },
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

type Story = StoryObj< typeof DateCalendar >;

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

export const CustomDefaultMonth: Story = {
	args: {
		defaultMonth: new Date( 2024, 0, 1 ), // January 2024
	},
};
