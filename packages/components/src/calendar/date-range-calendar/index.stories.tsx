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
import { DateRangeCalendar, TZDate } from '../';
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

function computePresetRange( preset: string ) {
	let targetRange;
	switch ( preset ) {
		case 'today':
			targetRange = { from: today, to: today };
			break;
		case 'last-7-days':
			targetRange = lastSevenDays( today );
			break;
		case 'last-30-days':
			targetRange = lastThirtyDays( today );
			break;
		case 'month-to-date':
			targetRange = monthToDate( today );
			break;
		case 'last-12-months':
			targetRange = lastTwelveMonths( today );
			break;
		case 'year-to-date':
			targetRange = yearToDate( today );
			break;
	}
	return targetRange;
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
	render: function ControlledDateRangeCalendar( args ) {
		const popoverTitleId = useId();
		const presetListboxId = useId();

		const [ range, setRange ] = useState< typeof args.selected | null >( null );
		const [ month, setMonth ] = useState< Date >();

		const popoverTriggerRef = useRef< HTMLButtonElement >( null );
		const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

		const [ activePresetId, setActivePresetId ] = useState< string | null >( null );
		const [ selectedPresetId, setSelectedPresetId ] = useState< string | null >( null );

		const onPresetSelect = ( presetId: string ) => {
			setSelectedPresetId( presetId );
			setActivePresetId( presetId );

			const targetRange = computePresetRange( presetId );
			if ( targetRange ) {
				setRange( targetRange );
				setMonth( targetRange.to );
			}
		};

		useEffect( () => {
			if ( ! range || ! range.from || ! range.to ) {
				setSelectedPresetId( null );
				return;
			}

			let foundPresetId: string | null = null;

			[
				'today',
				'last-7-days',
				'last-30-days',
				'month-to-date',
				'last-12-months',
				'year-to-date',
			].forEach( ( presetId ) => {
				const presetRange = computePresetRange( presetId );
				if (
					! foundPresetId &&
					presetRange &&
					isSameDay( range.from!, presetRange.from! ) &&
					isSameDay( range.to!, presetRange.to! )
				) {
					foundPresetId = presetId;
				}
			} );

			setSelectedPresetId( foundPresetId ?? 'custom' );
			setActivePresetId( foundPresetId ?? 'custom' );
		}, [ range ] );

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
					.date-range-calendar {
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
					{ ! range || ! range.from
						? 'Pick a date range'
						: `Selected:${ range.from.toLocaleDateString() } - ${
								range.to?.toLocaleDateString() ?? '?'
						  }` }
				</Button>

				{ isPopoverOpen && (
					<Popover
						role="dialog"
						open={ isPopoverOpen }
						offset={ 16 }
						anchor={ popoverTriggerRef.current }
						aria-labelledby={ popoverTitleId }
					>
						<VisuallyHidden id={ popoverTitleId }>Select a date range</VisuallyHidden>
						<HStack spacing={ 0 } className="popover-content-wrapper" alignment="top">
							<VisuallyHidden id={ presetListboxId }>Date range presets</VisuallyHidden>
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
									{ id: 'last-7-days', label: 'Last 7 days' },
									{ id: 'last-30-days', label: 'Last 30 days' },
									{ id: 'month-to-date', label: 'Month to date' },
									{ id: 'last-12-months', label: 'Last 12 months' },
									{ id: 'year-to-date', label: 'Year to date' },
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
											range?.from ? dateToInputValue( range.from ) : ''
										}
										onChange={ ( nextValue ) => {
											// Note: the following code doesn't handle time zones.
											setRange( {
												to: new Date( `${ nextValue }` ),
												...range,
												from: new Date( `${ nextValue }` ),
											} );
										} }
										className="date-input"
									/>

									<InputControl
										__next40pxDefaultSize
										label="End date"
										type="date"
										value={
											// Note: the following code doesn't handle time zones.
											range?.to ? dateToInputValue( range.to ) : ''
										}
										onChange={ ( nextValue ) => {
											// Note: the following code doesn't handle time zones.
											setRange( {
												from: new Date( `${ nextValue }` ),
												...range,
												to: new Date( `${ nextValue }` ),
											} );
										} }
										className="date-input"
									/>
								</HStack>

								<DateRangeCalendar
									{ ...args }
									selected={ range }
									onSelect={ ( selectedDate, ...rest ) => {
										setRange(
											// Set controlled state to null if there's no selection
											! selectedDate ||
												( selectedDate.from === undefined && selectedDate.to === undefined )
												? null
												: selectedDate
										);
										args.onSelect?.( selectedDate, ...rest );
									} }
									month={ month }
									onMonthChange={ setMonth }
									className="date-range-calendar"
								/>
							</VStack>

							<Button
								__next40pxDefaultSize
								variant="secondary"
								onClick={ () => {
									setRange( null );
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
	args: {
		numberOfMonths: 2,
	},
};
