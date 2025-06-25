/**
 * WordPress dependencies
 */
import {
	BaseControl,
	TimePicker,
	VisuallyHidden,
	SelectControl,
	__experimentalInputControl as InputControl,
	__experimentalNumberControl as NumberControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback } from '@wordpress/element';
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
	const onSelectDate = useCallback(
		( newDate: Date | undefined | null ) => {
			const dateValue = newDate
				? format( newDate, 'yyyy-MM-dd' )
				: undefined;
			onChange( { [ id ]: dateValue } );
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
				<InputControl
					__next40pxDefaultSize
					type="date"
					value={ value ? format( value, 'yyyy-MM-dd' ) : '' }
					onChange={ ( nextValue ) => {
						onChange( { [ id ]: nextValue } );
					} }
				/>
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
	const [ from, to ] = Array.isArray( value ) ? value : [];
	const selectedRange = {
		from: from && new Date( from ),
		to: to && new Date( to ),
	};

	const onSelectRange = useCallback(
		(
			newRange:
				| { from: Date | undefined; to?: Date | undefined }
				| undefined
		) => {
			if ( newRange?.from && newRange?.to ) {
				const fromDate = format( newRange.from, 'yyyy-MM-dd' );
				const toDate = format( newRange.to, 'yyyy-MM-dd' );
				onChange( { [ id ]: [ fromDate, toDate ] } );
			}
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
				<VStack spacing={ 2.5 }>
					<InputControl
						__next40pxDefaultSize
						type="date"
						label={ __( 'From' ) }
						value={ from ? format( from, 'yyyy-MM-dd' ) : '' }
						onChange={ ( nextValue ) => {
							onChange( { [ id ]: nextValue, to } );
						} }
					/>
					<InputControl
						__next40pxDefaultSize
						type="date"
						label={ __( 'To' ) }
						value={ to ? format( to, 'yyyy-MM-dd' ) : '' }
						onChange={ ( nextValue ) => {
							onChange( { [ id ]: from, to: nextValue } );
						} }
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
