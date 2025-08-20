import {
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

type DateInputsProps = {
	fromStr: string;
	toStr: string;
	onFromChange: ( v: string ) => void;
	onToChange: ( v: string ) => void;
	todayStr: string;
	fromStyle?: React.CSSProperties;
	toStyle?: React.CSSProperties;
	justify?:
		| 'flex-start'
		| 'flex-end'
		| 'center'
		| 'space-between'
		| 'space-around'
		| 'space-evenly';
	containerStyle?: React.CSSProperties;
};

export function DateInputs( {
	fromStr,
	toStr,
	onFromChange,
	onToChange,
	todayStr,
	fromStyle,
	toStyle,
	justify = 'flex-start',
	containerStyle,
}: DateInputsProps ) {
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
				onChange={ ( value?: string ) => onFromChange( value ?? '' ) }
				autoComplete="off"
				max={ toStr || todayStr }
				style={ fromStyle }
				__next40pxDefaultSize
			/>
			<InputControl
				type="date"
				label={ __( 'End date' ) }
				value={ toStr }
				onChange={ ( value?: string ) => onToChange( value ?? '' ) }
				autoComplete="off"
				min={ fromStr || undefined }
				style={ toStyle }
				__next40pxDefaultSize
			/>
		</HStack>
	);
}
