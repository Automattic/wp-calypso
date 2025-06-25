/**
 * WordPress dependencies
 */
import {
	BaseControl,
	TimePicker,
	VisuallyHidden,
	SelectControl,
	Button,
	__experimentalInputControl as InputControl,
	__experimentalNumberControl as NumberControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback, useState } from '@wordpress/element';
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
import {
	OPERATOR_IN_THE_PAST,
	OPERATOR_OVER,
	OPERATOR_ON,
	OPERATOR_NOT_ON,
	OPERATOR_BEFORE,
	OPERATOR_AFTER,
	OPERATOR_BEFORE_INC,
	OPERATOR_AFTER_INC,
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

const CALENDAR_OPERATORS = [
	OPERATOR_ON,
	OPERATOR_NOT_ON,
	OPERATOR_BEFORE,
	OPERATOR_AFTER,
	OPERATOR_BEFORE_INC,
	OPERATOR_AFTER_INC,
	OPERATOR_BETWEEN,
];
const RANGE_OPERATORS = [ OPERATOR_BETWEEN ];

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
			onChange( { [ id ]: dateValue } );
			setSelectedPresetId( preset.id );
		},
		[ id, onChange ]
	);

	const handleManualDateChange = useCallback(
		( nextValue: string | undefined ) => {
			onChange( { [ id ]: nextValue } );
			setSelectedPresetId( null );
		},
		[ id, onChange ]
	);

	return (
		<BaseControl
			__nextHasNoMarginBottom
			className="dataviews-controls__datetime"
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
								className="dataviews-controls__datetime-preset"
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
						className="dataviews-controls__datetime-preset"
						variant="tertiary"
						isPressed={ ! selectedPresetId }
						size="small"
						disabled={ !! selectedPresetId }
					>
						{ __( 'Custom' ) }
					</Button>
				</HStack>

				{ /* Date input field */ }
				<InputControl
					__next40pxDefaultSize
					type="date"
					value={ value ? format( value, 'yyyy-MM-dd' ) : '' }
					onChange={ handleManualDateChange }
				/>

				{ /* Calendar widget */ }
				<DateCalendar
					style={ { width: '100%' } }
					selected={ value }
					onSelect={ onSelectDate }
					autoFocus
					defaultMonth={ value ? new Date( value ) : new Date() }
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

	const [ from, to ] = Array.isArray( value ) ? value : [];
	const selectedRange = {
		from: from && new Date( from ),
		to: to && new Date( to ),
	};

	const normalizeStartOfDay = useCallback( ( dateInput: Date | string ) => {
		const dateStr =
			typeof dateInput === 'string'
				? dateInput
				: format( dateInput, 'yyyy-MM-dd' );
		return `${ dateStr } 00:00:00`;
	}, [] );

	const normalizeEndOfDay = useCallback( ( dateInput: Date | string ) => {
		const dateStr =
			typeof dateInput === 'string'
				? dateInput
				: format( dateInput, 'yyyy-MM-dd' );
		return `${ dateStr } 23:59:59`;
	}, [] );

	const updateDateRange = useCallback(
		(
			fromDate: Date | string | undefined,
			toDate: Date | string | undefined
		) => {
			let normalizedFrom: string | undefined;
			let normalizedTo: string | undefined;

			if ( fromDate ) {
				normalizedFrom = normalizeStartOfDay( fromDate );
			}

			if ( toDate ) {
				normalizedTo = normalizeEndOfDay( toDate );
			}

			onChange( { [ id ]: [ normalizedFrom, normalizedTo ] } );
		},
		[ id, onChange, normalizeStartOfDay, normalizeEndOfDay ]
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
			updateDateRange( startDate, endDate );
			setSelectedPresetId( preset.id );
		},
		[ updateDateRange ]
	);

	const handleManualDateChange = useCallback(
		( field: 'from' | 'to', nextValue: string | undefined ) => {
			if ( field === 'from' ) {
				updateDateRange( nextValue, to );
			} else {
				updateDateRange( from, nextValue );
			}
			setSelectedPresetId( null );
		},
		[ updateDateRange, from, to ]
	);

	return (
		<BaseControl
			__nextHasNoMarginBottom
			className="dataviews-controls__datetime"
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
								className="dataviews-controls__datetime-preset"
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
						className="dataviews-controls__datetime-preset"
						variant="tertiary"
						isPressed={ ! selectedPresetId }
						size="small"
						disabled={ !! selectedPresetId }
					>
						{ __( 'Custom' ) }
					</Button>
				</HStack>

				{ /* Date input fields */ }
				<VStack spacing={ 2.5 }>
					<InputControl
						__next40pxDefaultSize
						type="date"
						label={ __( 'From' ) }
						value={ from ? format( from, 'yyyy-MM-dd' ) : '' }
						onChange={ ( nextValue ) =>
							handleManualDateChange( 'from', nextValue )
						}
					/>
					<InputControl
						__next40pxDefaultSize
						type="date"
						label={ __( 'To' ) }
						value={ to ? format( to, 'yyyy-MM-dd' ) : '' }
						onChange={ ( nextValue ) =>
							handleManualDateChange( 'to', nextValue )
						}
					/>
				</VStack>
				<DateRangeCalendar
					style={ { width: '100%' } }
					selected={ selectedRange }
					onSelect={ onSelectRange }
					autoFocus
					defaultMonth={ selectedRange?.from || new Date() }
				/>
			</VStack>
		</BaseControl>
	);
}

function RelativeDateControl( {
	id,
	value,
	onChange,
	label,
	hideLabelFromVision,
	options,
}: {
	id: string;
	value: { value?: string | number; unit?: string };
	onChange: ( value: any ) => void;
	label: string;
	hideLabelFromVision?: boolean;
	options: { value: string; label: string }[];
} ) {
	const { value: relValue = '', unit = options[ 0 ].value } = value;

	const onChangeValue = useCallback(
		( newValue: string | undefined ) =>
			onChange( {
				[ id ]: { value: Number( newValue ), unit },
			} ),
		[ id, onChange, unit ]
	);

	const onChangeUnit = useCallback(
		( newUnit: string | undefined ) =>
			onChange( {
				[ id ]: { value: relValue, unit: newUnit },
			} ),
		[ id, onChange, relValue ]
	);

	return (
		<BaseControl
			__nextHasNoMarginBottom
			className="dataviews-controls__datetime"
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
		>
			<HStack spacing={ 2.5 }>
				<NumberControl
					__next40pxDefaultSize
					className="dataviews-controls__datetime-number"
					spinControls="none"
					min={ 1 }
					step={ 1 }
					value={ relValue }
					onChange={ onChangeValue }
				/>
				<SelectControl
					className="dataviews-controls__datetime-unit"
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Unit' ) }
					value={ unit }
					options={ options }
					onChange={ onChangeUnit }
					hideLabelFromVision={ true }
				/>
			</HStack>
		</BaseControl>
	);
}

export default function DateTime< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
	operator,
}: DataFormControlProps< Item > ) {
	const { id, label } = field;
	const value = field.getValue( { item: data } );

	const onChangeControl = useCallback(
		( newValue: string | null ) => onChange( { [ id ]: newValue } ),
		[ id, onChange ]
	);

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

	if ( operator && CALENDAR_OPERATORS.includes( operator ) ) {
		if ( RANGE_OPERATORS.includes( operator ) ) {
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

	return (
		<fieldset className="dataviews-controls__datetime">
			{ ! hideLabelFromVision && (
				<BaseControl.VisualLabel as="legend">
					{ label }
				</BaseControl.VisualLabel>
			) }
			{ hideLabelFromVision && (
				<VisuallyHidden as="legend">{ label }</VisuallyHidden>
			) }
			<TimePicker
				currentTime={ typeof value === 'string' ? value : undefined }
				onChange={ onChangeControl }
				hideLabelFromVision
			/>
		</fieldset>
	);
}
