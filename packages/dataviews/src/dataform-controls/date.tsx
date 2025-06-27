/**
 * WordPress dependencies
 */
import {
	BaseControl,
	Button,
	__experimentalInputControl as InputControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getDate } from '@wordpress/date';

/**
 * External dependencies
 */
import { DateCalendar, DateRangeCalendar } from '@automattic/ui';
import { format, isValid } from 'date-fns';

/**
 * Parse date strings safely
 *
 * @param dateString - The date string to parse
 * @returns Parsed Date object or null if invalid
 */
function parseDate( dateString: string | undefined ): Date | null {
	if ( ! dateString ) {
		return null;
	}
	const parsedDate = getDate( dateString );
	return parsedDate && isValid( parsedDate ) ? parsedDate : null;
}

/**
 * Internal dependencies
 */
import type { DataFormControlProps } from '../types';
import RelativeDateControl from './relative-date-control';
import {
	OPERATOR_IN_THE_PAST,
	OPERATOR_OVER,
	OPERATOR_BETWEEN,
} from '../constants';

const TIME_UNITS_OPTIONS = {
	[ OPERATOR_IN_THE_PAST ]: [
		{ value: 'days', label: __( 'Days' ) },
		{ value: 'weeks', label: __( 'Weeks' ) },
		{ value: 'months', label: __( 'Months' ) },
		{ value: 'years', label: __( 'Years' ) },
	],
	[ OPERATOR_OVER ]: [
		{ value: 'days', label: __( 'Days ago' ) },
		{ value: 'weeks', label: __( 'Weeks ago' ) },
		{ value: 'months', label: __( 'Months ago' ) },
		{ value: 'years', label: __( 'Years ago' ) },
	],
};

const DATE_PRESETS = [
	{
		id: 'today',
		label: __( 'Today' ),
		getValue: () => new Date(),
	},
	{
		id: 'yesterday',
		label: __( 'Yesterday' ),
		getValue: () => {
			const date = new Date();
			date.setDate( date.getDate() - 1 );
			return date;
		},
	},
	{
		id: 'past-week',
		label: __( 'Past week' ),
		getValue: () => {
			const date = new Date();
			date.setDate( date.getDate() - 7 );
			return date;
		},
	},
	{
		id: 'past-month',
		label: __( 'Past month' ),
		getValue: () => {
			const date = new Date();
			date.setMonth( date.getMonth() - 1 );
			return date;
		},
	},
];

// Date range preset options
const DATE_RANGE_PRESETS = [
	{
		id: 'today',
		label: __( 'Today' ),
		getValue: () => {
			const today = new Date();
			return [ today, today ];
		},
	},
	{
		id: 'yesterday',
		label: __( 'Yesterday' ),
		getValue: () => {
			const yesterday = new Date();
			yesterday.setDate( yesterday.getDate() - 1 );
			return [ yesterday, yesterday ];
		},
	},
	{
		id: 'last-7-days',
		label: __( 'Last 7 days' ),
		getValue: () => {
			const today = new Date();
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate( sevenDaysAgo.getDate() - 7 );
			return [ sevenDaysAgo, today ];
		},
	},
	{
		id: 'last-30-days',
		label: __( 'Last 30 days' ),
		getValue: () => {
			const today = new Date();
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate( thirtyDaysAgo.getDate() - 30 );
			return [ thirtyDaysAgo, today ];
		},
	},
];

function CalendarDateControl( {
	id,
	value,
	onChange,
	label,
	hideLabelFromVision,
	className,
}: {
	id: string;
	value: string | undefined;
	onChange: ( value: any ) => void;
	label: string;
	hideLabelFromVision?: boolean;
	className?: string;
} ) {
	const [ selectedPresetId, setSelectedPresetId ] = useState< string | null >(
		null
	);

	const [ calendarMonth, setCalendarMonth ] = useState< Date >( () => {
		const parsedDate = parseDate( value );
		return parsedDate || new Date(); // Default to current month
	} );

	const onSelectDate = useCallback(
		( newDate: Date | undefined | null ) => {
			const dateValue = newDate
				? format( newDate, 'yyyy-MM-dd' )
				: undefined;
			onChange( { [ id ]: dateValue } );
			setSelectedPresetId( null );
		},
		[ id, onChange ]
	);

	const handlePresetClick = useCallback(
		( preset: ( typeof DATE_PRESETS )[ 0 ] ) => {
			const presetDate = preset.getValue();
			const dateValue = format( presetDate, 'yyyy-MM-dd' );

			// Auto-navigate calendar to preset date
			setCalendarMonth( presetDate );
			onChange( { [ id ]: dateValue } );
			setSelectedPresetId( preset.id );
		},
		[ id, onChange ]
	);

	const handleManualDateChange = useCallback(
		( newValue: string | undefined ) => {
			if ( ! newValue ) {
				onChange( { [ id ]: undefined } );
				setSelectedPresetId( null );
				return;
			}

			onChange( { [ id ]: newValue } );

			const parsedDate = parseDate( newValue );
			if ( parsedDate ) {
				setCalendarMonth( parsedDate );
			}
			setSelectedPresetId( null );
		},
		[ id, onChange ]
	);

	return (
		<BaseControl
			__nextHasNoMarginBottom
			className={ className }
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
		>
			<VStack spacing={ 4 }>
				{ /* Preset buttons */ }
				<HStack spacing={ 2 } wrap={ true } justify="flex-start">
					{ DATE_PRESETS.map( ( preset ) => {
						const isSelected = selectedPresetId === preset.id;
						return (
							<Button
								className="dataviews-controls__date-preset"
								key={ preset.id }
								variant="tertiary"
								isPressed={ isSelected }
								size="small"
								onClick={ () => handlePresetClick( preset ) }
							>
								{ preset.label }
							</Button>
						);
					} ) }
					<Button
						className="dataviews-controls__date-preset"
						variant="tertiary"
						isPressed={ ! selectedPresetId }
						size="small"
						disabled={ !! selectedPresetId }
					>
						{ __( 'Custom' ) }
					</Button>
				</HStack>

				{ /* Manual date input */ }
				<InputControl
					__next40pxDefaultSize
					type="date"
					label={ __( 'Date' ) }
					hideLabelFromVision
					value={ value }
					onChange={ handleManualDateChange }
				/>

				{ /* Calendar widget */ }
				<DateCalendar
					style={ { width: '100%' } }
					selected={
						value ? parseDate( value ) || undefined : undefined
					}
					onSelect={ onSelectDate }
					month={ calendarMonth }
					onMonthChange={ setCalendarMonth }
				/>
			</VStack>
		</BaseControl>
	);
}

function CalendarDateRangeControl( {
	id,
	value,
	onChange,
	label,
	hideLabelFromVision,
	className,
}: {
	id: string;
	value: [ string, string ] | undefined;
	onChange: ( value: any ) => void;
	label: string;
	hideLabelFromVision?: boolean;
	className?: string;
} ) {
	const [ selectedPresetId, setSelectedPresetId ] = useState< string | null >(
		null
	);

	const selectedRange = useMemo( () => {
		if ( ! value ) {
			return { from: undefined, to: undefined };
		}

		const [ from, to ] = value;
		return {
			from: parseDate( from ) || undefined,
			to: parseDate( to ) || undefined,
		};
	}, [ value ] );

	const [ calendarMonth, setCalendarMonth ] = useState< Date >( () => {
		return selectedRange.from || new Date();
	} );

	const normalizeDate = useCallback( ( date: Date | string | undefined ) => {
		if ( ! date ) {
			return '';
		}
		return typeof date === 'string' ? date : format( date, 'yyyy-MM-dd' );
	}, [] );

	const updateDateRange = useCallback(
		(
			fromDate: Date | string | undefined,
			toDate: Date | string | undefined
		) => {
			if ( fromDate || toDate ) {
				onChange( {
					[ id ]: [
						normalizeDate( fromDate ),
						normalizeDate( toDate ),
					],
				} );
			} else {
				onChange( { [ id ]: undefined } );
			}
		},
		[ id, onChange ]
	);

	const onSelectRange = useCallback(
		(
			newRange:
				| { from: Date | undefined; to?: Date | undefined }
				| undefined
		) => {
			updateDateRange( newRange?.from, newRange?.to );
			setSelectedPresetId( null );
		},
		[ updateDateRange ]
	);

	const handlePresetClick = useCallback(
		( preset: ( typeof DATE_RANGE_PRESETS )[ 0 ] ) => {
			const [ startDate, endDate ] = preset.getValue();
			// Auto-navigate calendar to start date of range
			setCalendarMonth( startDate );
			updateDateRange( startDate, endDate );
			setSelectedPresetId( preset.id );
		},
		[ updateDateRange ]
	);

	const handleManualDateChange = useCallback(
		( fromOrTo: 'from' | 'to', newValue: string | undefined ) => {
			const [ currentFrom, currentTo ] = value || [
				undefined,
				undefined,
			];

			if ( ! newValue ) {
				updateDateRange(
					fromOrTo === 'from' ? undefined : currentFrom,
					fromOrTo === 'to' ? undefined : currentTo
				);
				setSelectedPresetId( null );
				return;
			}

			updateDateRange(
				fromOrTo === 'from' ? newValue : currentFrom,
				fromOrTo === 'to' ? newValue : currentTo
			);

			// Update calendar to show this month
			const parsedDate = parseDate( newValue );
			if ( parsedDate ) {
				setCalendarMonth( parsedDate );
			}

			setSelectedPresetId( null );
		},
		[ value, updateDateRange ]
	);

	return (
		<BaseControl
			__nextHasNoMarginBottom
			className={ className }
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
		>
			<VStack spacing={ 4 }>
				{ /* Preset buttons */ }
				<HStack spacing={ 2 } wrap={ true } justify="flex-start">
					{ DATE_RANGE_PRESETS.map( ( preset ) => {
						const isSelected = selectedPresetId === preset.id;
						return (
							<Button
								className="dataviews-controls__date-preset"
								key={ preset.id }
								variant="tertiary"
								isPressed={ isSelected }
								size="small"
								onClick={ () => handlePresetClick( preset ) }
							>
								{ preset.label }
							</Button>
						);
					} ) }
					<Button
						className="dataviews-controls__date-preset"
						variant="tertiary"
						isPressed={ ! selectedPresetId }
						size="small"
						disabled={ !! selectedPresetId }
					>
						{ __( 'Custom' ) }
					</Button>
				</HStack>

				{ /* Manual date range inputs */ }
				<HStack spacing={ 2 }>
					<InputControl
						__next40pxDefaultSize
						type="date"
						label={ __( 'From' ) }
						hideLabelFromVision
						value={ value?.[ 0 ] }
						onChange={ ( newValue ) =>
							handleManualDateChange( 'from', newValue )
						}
					/>
					<InputControl
						__next40pxDefaultSize
						type="date"
						label={ __( 'To' ) }
						hideLabelFromVision
						value={ value?.[ 1 ] }
						onChange={ ( newValue ) =>
							handleManualDateChange( 'to', newValue )
						}
					/>
				</HStack>

				<DateRangeCalendar
					style={ { width: '100%' } }
					selected={ selectedRange }
					onSelect={ onSelectRange }
					month={ calendarMonth }
					onMonthChange={ setCalendarMonth }
				/>
			</VStack>
		</BaseControl>
	);
}

export default function DateControl< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
	operator,
}: DataFormControlProps< Item > ) {
	const { id, label } = field;
	const value = field.getValue( { item: data } );

	if ( operator === OPERATOR_IN_THE_PAST || operator === OPERATOR_OVER ) {
		return (
			<RelativeDateControl
				className="dataviews-controls__date"
				id={ id }
				value={ value && typeof value === 'object' ? value : {} }
				onChange={ onChange }
				label={ label }
				hideLabelFromVision={ hideLabelFromVision }
				options={ TIME_UNITS_OPTIONS[ operator ] }
			/>
		);
	}

	if ( operator === OPERATOR_BETWEEN ) {
		let dateRangeValue: [ string, string ] | undefined;
		if (
			Array.isArray( value ) &&
			value.length === 2 &&
			value.every( ( date ) => typeof date === 'string' )
		) {
			dateRangeValue = value as unknown as [ string, string ];
		}

		return (
			<CalendarDateRangeControl
				className="dataviews-controls__date"
				id={ id }
				value={ dateRangeValue }
				onChange={ onChange }
				label={ label }
				hideLabelFromVision={ hideLabelFromVision }
			/>
		);
	}

	return (
		<CalendarDateControl
			className="dataviews-controls__date"
			id={ id }
			value={ typeof value === 'string' ? value : undefined }
			onChange={ onChange }
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
		/>
	);
}
