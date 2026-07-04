import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { FocusEvent } from 'react';

type DateInputsProps = {
	fromStr: string;
	toStr: string;
	onFromChange: ( v: string ) => void;
	onToChange: ( v: string ) => void;
	todayStr: string;
	minStr?: string;
	fromStyle?: React.CSSProperties;
	toStyle?: React.CSSProperties;
	stack?: boolean;
	justify?:
		| 'flex-start'
		| 'flex-end'
		| 'center'
		| 'space-between'
		| 'space-around'
		| 'space-evenly';
	containerStyle?: React.CSSProperties;
	onFromFocus?: ( e: FocusEvent< HTMLInputElement > ) => void;
	onToFocus?: ( e: FocusEvent< HTMLInputElement > ) => void;
	onFromBlur?: ( e: FocusEvent< HTMLInputElement > ) => void;
	onToBlur?: ( e: FocusEvent< HTMLInputElement > ) => void;
	// Optional time-of-day inputs, paired below each date input.
	showTime?: boolean;
	fromTime?: string;
	toTime?: string;
	onFromTimeChange?: ( v: string ) => void;
	onToTimeChange?: ( v: string ) => void;
};

export function DateInputs( {
	fromStr,
	toStr,
	onFromChange,
	onToChange,
	todayStr,
	minStr,
	fromStyle,
	toStyle,
	stack = false,
	justify = 'flex-start',
	containerStyle,
	onFromFocus,
	onToFocus,
	onFromBlur,
	onToBlur,
	showTime = false,
	fromTime = '',
	toTime = '',
	onFromTimeChange,
	onToTimeChange,
}: DateInputsProps ) {
	// One side of the range: a date input, optionally with a time input paired
	// below it. Width styles live on the wrapper so the date and time inputs
	// align into a single column.
	const side = ( {
		dateLabel,
		timeLabel,
		value,
		onChange,
		onFocus,
		onBlur,
		min,
		max,
		style,
		timeValue,
		onTimeChange,
	}: {
		dateLabel: string;
		timeLabel: string;
		value: string;
		onChange: ( v: string ) => void;
		onFocus?: ( e: FocusEvent< HTMLInputElement > ) => void;
		onBlur?: ( e: FocusEvent< HTMLInputElement > ) => void;
		min?: string;
		max?: string;
		style?: React.CSSProperties;
		timeValue: string;
		onTimeChange?: ( v: string ) => void;
	} ) => (
		<VStack as="div" spacing={ 2 } style={ style }>
			<InputControl
				type="date"
				label={ dateLabel }
				value={ value }
				onFocus={ onFocus }
				onBlur={ onBlur }
				onChange={ ( next?: string ) => onChange( next ?? '' ) }
				autoComplete="off"
				min={ min }
				max={ max }
				style={ { width: '100%' } }
				__next40pxDefaultSize
			/>
			{ showTime && (
				<InputControl
					type="time"
					label={ timeLabel }
					value={ timeValue }
					onChange={ ( next?: string ) => onTimeChange?.( next ?? '' ) }
					autoComplete="off"
					style={ { width: '100%' } }
					__next40pxDefaultSize
				/>
			) }
		</VStack>
	);

	const fromSide = side( {
		dateLabel: __( 'Start date' ),
		timeLabel: __( 'Start time' ),
		value: fromStr,
		onChange: onFromChange,
		onFocus: onFromFocus,
		onBlur: onFromBlur,
		min: minStr,
		max: toStr || todayStr,
		style: fromStyle,
		timeValue: fromTime,
		onTimeChange: onFromTimeChange,
	} );

	const toSide = side( {
		dateLabel: __( 'End date' ),
		timeLabel: __( 'End time' ),
		value: toStr,
		onChange: onToChange,
		onFocus: onToFocus,
		onBlur: onToBlur,
		min: fromStr || minStr,
		style: toStyle,
		timeValue: toTime,
		onTimeChange: onToTimeChange,
	} );

	if ( stack ) {
		return (
			<VStack as="div" spacing={ 3 } className="daterange-inputs" style={ containerStyle }>
				{ fromSide }
				{ toSide }
			</VStack>
		);
	}

	return (
		<HStack
			as="div"
			spacing={ 8 }
			justify={ justify }
			alignment="flex-start"
			className="daterange-inputs"
			wrap={ false }
			style={ containerStyle }
		>
			{ fromSide }
			{ toSide }
		</HStack>
	);
}
