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
};

export function DateInputs( {
	fromStr,
	toStr,
	onFromChange,
	onToChange,
	todayStr,
	fromStyle,
	toStyle,
	stack = false,
	justify = 'flex-start',
	containerStyle,
	onFromFocus,
	onToFocus,
	onFromBlur,
	onToBlur,
}: DateInputsProps ) {
	if ( stack ) {
		return (
			<VStack as="div" spacing={ 2 } className="daterange-inputs" style={ containerStyle }>
				<InputControl
					type="date"
					label={ __( 'Start date' ) }
					value={ fromStr }
					onFocus={ ( e: FocusEvent< HTMLInputElement > ) => {
						onFromFocus?.( e );
					} }
					onBlur={ ( e: FocusEvent< HTMLInputElement > ) => {
						onFromBlur?.( e );
					} }
					onChange={ ( value?: string ) => {
						onFromChange( value ?? '' );
					} }
					autoComplete="off"
					max={ toStr || todayStr }
					style={ { width: '100%', ...( fromStyle || {} ) } }
					__next40pxDefaultSize
				/>
				<InputControl
					type="date"
					label={ __( 'End date' ) }
					value={ toStr }
					onFocus={ ( e: FocusEvent< HTMLInputElement > ) => {
						onToFocus?.( e );
					} }
					onBlur={ ( e: FocusEvent< HTMLInputElement > ) => {
						onToBlur?.( e );
					} }
					onChange={ ( value?: string ) => {
						onToChange( value ?? '' );
					} }
					autoComplete="off"
					min={ fromStr || undefined }
					style={ { width: '100%', ...( toStyle || {} ) } }
					__next40pxDefaultSize
				/>
			</VStack>
		);
	}

	return (
		<HStack
			as="div"
			spacing={ 8 }
			justify={ justify }
			className="daterange-inputs"
			wrap={ false }
			style={ containerStyle }
		>
			<InputControl
				type="date"
				label={ __( 'Start date' ) }
				value={ fromStr }
				onFocus={ ( e: FocusEvent< HTMLInputElement > ) => {
					onFromFocus?.( e );
				} }
				onBlur={ ( e: FocusEvent< HTMLInputElement > ) => {
					onFromBlur?.( e );
				} }
				onChange={ ( value?: string ) => {
					onFromChange( value ?? '' );
				} }
				autoComplete="off"
				max={ toStr || todayStr }
				style={ fromStyle }
				__next40pxDefaultSize
			/>
			<InputControl
				type="date"
				label={ __( 'End date' ) }
				value={ toStr }
				onFocus={ ( e: FocusEvent< HTMLInputElement > ) => {
					onToFocus?.( e );
				} }
				onBlur={ ( e: FocusEvent< HTMLInputElement > ) => {
					onToBlur?.( e );
				} }
				onChange={ ( value?: string ) => {
					onToChange( value ?? '' );
				} }
				autoComplete="off"
				min={ fromStr || undefined }
				style={ toStyle }
				__next40pxDefaultSize
			/>
		</HStack>
	);
}
