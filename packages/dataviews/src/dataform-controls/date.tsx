/**
 * WordPress dependencies
 */
import {
	BaseControl,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { DateCalendar, DateRangeCalendar } from '@automattic/ui';
import { format, isValid } from 'date-fns';

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
}: {
	id: string;
	value: Date | undefined;
	onChange: ( value: any ) => void;
	label: string;
	hideLabelFromVision?: boolean;
} ) {
	const [ selectedPresetId, setSelectedPresetId ] = useState< string | null >(
		null
	);

	const [ calendarMonth, setCalendarMonth ] = useState< Date >( () => {
		if ( value && isValid( new Date( value ) ) ) {
			return new Date( value );
		}
		return new Date(); // Default to current month
	} );

	// Update calendar month when value changes externally
	useMemo( () => {
		if ( value && isValid( new Date( value ) ) ) {
			setCalendarMonth( new Date( value ) );
		}
	}, [ value ] );

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

	return (
		<BaseControl
			__nextHasNoMarginBottom
			className="dataviews-controls__date"
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

				{ /* Calendar widget */ }
				<DateCalendar
					style={ { width: '100%' } }
					selected={ value }
					onSelect={ onSelectDate }
					month={ calendarMonth }
					onMonthChange={ setCalendarMonth }
					autoFocus
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
}: {
	id: string;
	value: [ Date, Date ] | undefined;
	onChange: ( value: any ) => void;
	label: string;
	hideLabelFromVision?: boolean;
} ) {
	const [ selectedPresetId, setSelectedPresetId ] = useState< string | null >(
		null
	);

	const selectedRange = useMemo( () => {
		const [ from, to ] = Array.isArray( value )
			? value
			: [ undefined, undefined ];

		return {
			from:
				from && isValid( new Date( from ) )
					? new Date( from )
					: undefined,
			to: to && isValid( new Date( to ) ) ? new Date( to ) : undefined,
		};
	}, [ value ] );

	const [ calendarMonth, setCalendarMonth ] = useState< Date >( () => {
		if ( selectedRange.from ) {
			return selectedRange.from;
		}
		return new Date(); // Default to current month
	} );

	// Update calendar month when range changes externally
	useMemo( () => {
		if ( selectedRange.from ) {
			setCalendarMonth( selectedRange.from );
		}
	}, [ selectedRange.from ] );

	const normalizeDate = useCallback( ( dateInput: Date | string ) => {
		const dateStr =
			typeof dateInput === 'string'
				? dateInput
				: format( dateInput, 'yyyy-MM-dd' );
		return dateStr;
	}, [] );

	const updateDateRange = useCallback(
		(
			fromDate: Date | string | undefined,
			toDate: Date | string | undefined
		) => {
			if ( fromDate && toDate ) {
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
		[ id, onChange, normalizeDate ]
	);

	const onSelectRange = useCallback(
		(
			newRange:
				| { from: Date | undefined; to?: Date | undefined }
				| undefined
		) => {
			if ( newRange?.from && newRange?.to ) {
				updateDateRange( newRange.from, newRange.to );
			}
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

	return (
		<BaseControl
			__nextHasNoMarginBottom
			className="dataviews-controls__date"
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

				<DateRangeCalendar
					style={ { width: '100%' } }
					selected={ selectedRange }
					onSelect={ onSelectRange }
					month={ calendarMonth }
					onMonthChange={ setCalendarMonth }
					autoFocus
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
		return (
			<CalendarDateRangeControl
				id={ id }
				value={ value }
				onChange={ onChange }
				label={ label }
				hideLabelFromVision={ hideLabelFromVision }
			/>
		);
	}

	return (
		<CalendarDateControl
			id={ id }
			value={
				typeof value === 'string' && isValid( new Date( value ) )
					? new Date( value )
					: undefined
			}
			onChange={ onChange }
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
		/>
	);
}
