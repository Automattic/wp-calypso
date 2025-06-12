import { fn } from '@storybook/test';
import {
	Button,
	Composite,
	Popover,
	__experimentalInputControl as InputControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	VisuallyHidden,
} from '@wordpress/components';
import { isSameDay } from 'date-fns';
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
import { useState, useEffect, useRef, useId } from 'react';
import { DateCalendar, TZDate } from '../';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof DateCalendar > = {
	title: 'DateCalendar',
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

/**
 * When working with time zones, use the `TZDate` object exported by this package instead of the native `Date` object.
 */
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
					before today, and starting with a default date of 1 week from today.
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

function computePresetRange( preset: string ) {
	let targetDate;
	switch ( preset ) {
		case 'today':
			targetDate = today;
			break;
		case 'one-week-ago':
			targetDate = oneWeekBefore( today );
			break;
		case 'start-of-month':
			targetDate = startOfMonth( today );
			break;
		case 'one-month-ago':
			targetDate = oneMonthBefore( today );
			break;
		case 'start-of-year':
			targetDate = startOfYear( today );
			break;
		case 'one-year-ago':
			targetDate = oneYearBefore( today );
			break;
	}
	return targetDate;
}

function PresetItem( {
	id,
	label,
	selected,
	setSelected,
}: {
	id: string;
	label: string;
	selected: boolean;
	setSelected: ( id: string ) => void;
} ) {
	return (
		<Composite.Item
			render={ <Button __next40pxDefaultSize variant={ selected ? 'primary' : undefined } /> }
			id={ id }
			onClick={ () => setSelected( id ) }
			role="option"
			aria-selected={ selected ? 'true' : undefined }
			className="preset-listbox__item"
			// It's fine to autofocus when the popover opens
		>
			<span className="preset-listbox__item-label">
				{ label }
				<span
					className="preset-listbox__item-label-bullet"
					style={ { visibility: selected ? 'visible' : 'hidden' } }
				>
					&bull;
				</span>
			</span>
		</Composite.Item>
	);
}

/**
 * The component can be used in controlled mode. This is useful, for example,
 * when in need of keeping the component in sync with external input fields or
 * more advanced UI patterns such as a preset selector.
 *
 * _Note: this example doesn't handle time zones, and is not responsive. Do not
 * assume this is production-ready code._
 */
export const WithPresetsDialog: Story = {
	render: function ControlledDateCalendar( args ) {
		const popoverTitleId = useId();
		const presetListboxId = useId();

		const [ selectedDate, setSelectedDate ] = useState< typeof args.selected | null >( null );
		const [ month, setMonth ] = useState< Date >();

		const popoverTriggerRef = useRef< HTMLButtonElement >( null );
		const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

		const [ activePresetId, setActivePresetId ] = useState< string | null >( null );
		const [ selectedPresetId, setSelectedPresetId ] = useState< string | null >( null );

		const onPresetSelect = ( presetId: string ) => {
			setSelectedPresetId( presetId );
			setActivePresetId( presetId );

			const targetDate = computePresetRange( presetId );
			if ( targetDate ) {
				setSelectedDate( targetDate );
				setMonth( targetDate );
			}
		};

		useEffect( () => {
			if ( ! selectedDate ) {
				setSelectedPresetId( null );
				return;
			}

			let foundPresetId: string | null = null;

			[
				'today',
				'one-week-ago',
				'start-of-month',
				'one-month-ago',
				'start-of-year',
				'one-year-ago',
			].forEach( ( presetId ) => {
				const presetDate = computePresetRange( presetId );
				if ( ! foundPresetId && presetDate && isSameDay( presetDate, selectedDate ) ) {
					foundPresetId = presetId;
				}
			} );

			setSelectedPresetId( foundPresetId ?? 'custom' );
			setActivePresetId( foundPresetId ?? 'custom' );
		}, [ selectedDate ] );

		return (
			<>
				<style>{ `
					.popover-content-wrapper {
						width: max-content;
					}
					.preset-listbox {
						align-self: stretch;
						flex-shrink: 0;
						padding: 12px 16px;
						border-inline-end: 1px solid #ccc;
					}
					.preset-listbox:has([data-active-item]):focus {
						outline: 3px solid transparent;
					}
					.preset-listbox__group {
						outline: 1px solid red;
					}
					.preset-listbox__item:last-child {
						margin-block-start: auto;
					}
					.preset-listbox:focus .preset-listbox__item[data-active-item] {
						box-shadow:0 0 0 var(--wp-admin-border-width-focus) var(--wp-components-color-accent, var(--wp-admin-theme-color, #3858e9));
						outline: 3px solid transparent;
					}
					.preset-listbox__item-label {
						width: 100%;
						display: flex;
						align-items: center;
						gap: 8px;
						justify-content: space-between;
					}
					.preset-listbox__item-label-bullet {
						font-size: 2em;
						position: relative;
						top: -0.06em;
					}
					.date-controls-wrapper {
						padding: 24px;
					}
					.date-input {
						flex: 1;
					}
					.date-calendar {
						z-index: 0;
						min-height: 300px;
					}
					.reset-button {
						position: absolute;
						inset-inline-end: 24px;
						inset-block-end: 12px;
					}
				` }</style>
				<Button
					__next40pxDefaultSize
					variant="secondary"
					ref={ popoverTriggerRef }
					onClick={ () => setIsPopoverOpen( ! isPopoverOpen ) }
				>
					{ ! selectedDate ? 'Pick a date' : `Selected:${ selectedDate.toLocaleDateString() }` }
				</Button>

				{ isPopoverOpen && (
					<Popover
						role="dialog"
						open={ isPopoverOpen }
						offset={ 16 }
						anchor={ popoverTriggerRef.current }
						aria-labelledby={ popoverTitleId }
					>
						<VisuallyHidden id={ popoverTitleId }>Select a date</VisuallyHidden>
						<HStack spacing={ 0 } className="popover-content-wrapper" alignment="top">
							<VisuallyHidden id={ presetListboxId }>Date presets</VisuallyHidden>
							<Composite
								aria-labelledby={ presetListboxId }
								activeId={ activePresetId }
								setActiveId={ ( activeId ) => {
									setActivePresetId( activeId ?? null );
								} }
								focusLoop
								virtualFocus
								render={
									// @ts-expect-error children are passed directly to Composite
									<VStack justify="flex-start" alignment="stretch" spacing={ 0 } />
								}
								role="listbox"
								className="preset-listbox"
								onFocus={ () => {
									if ( ! activePresetId ) {
										setActivePresetId( 'today' );
									}
								} }
							>
								{ [
									{ id: 'today', label: 'Today' },
									{ id: 'one-week-ago', label: 'One week ago' },
									{ id: 'start-of-month', label: 'Start of this month' },
									{ id: 'one-month-ago', label: 'One month ago' },
									{ id: 'start-of-year', label: 'Start of the year' },
									{ id: 'one-year-ago', label: 'One year ago' },
									{ id: 'custom', label: 'Custom' },
								].map( ( preset ) => (
									<PresetItem
										key={ preset.id }
										id={ preset.id }
										label={ preset.label }
										selected={ selectedPresetId === preset.id }
										setSelected={ onPresetSelect }
									/>
								) ) }
							</Composite>

							<VStack spacing={ 8 } className="date-controls-wrapper">
								<HStack justify="space-between" spacing={ 8 }>
									<InputControl
										__next40pxDefaultSize
										label="Start date"
										type="date"
										value={
											// Note: the following code doesn't handle time zones.
											selectedDate ? dateToInputValue( selectedDate ) : ''
										}
										onChange={ ( nextValue ) => {
											// Note: the following code doesn't handle time zones.
											setSelectedDate( new Date( `${ nextValue }` ) );
										} }
										className="date-input"
									/>
								</HStack>

								<DateCalendar
									{ ...args }
									selected={ selectedDate }
									onSelect={ ( selectedDate, ...rest ) => {
										setSelectedDate( selectedDate ?? null );
										args.onSelect?.( selectedDate, ...rest );
									} }
									month={ month }
									onMonthChange={ setMonth }
									className="date-calendar"
								/>
							</VStack>

							<Button
								__next40pxDefaultSize
								variant="secondary"
								onClick={ () => {
									setSelectedDate( null );
									setMonth( today );
									setSelectedPresetId( null );
									setActivePresetId( null );
								} }
								className="reset-button"
							>
								Reset
							</Button>
						</HStack>
					</Popover>
				) }
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
