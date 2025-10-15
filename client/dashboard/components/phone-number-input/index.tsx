import { smsCountryCodesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import './style.scss';

export type SecuritySMSNumber = {
	phoneNumber: string;
	countryCode: string;
	countryNumericCode: string;
};

export default function PhoneNumberInput( {
	data,
	onChange,
	isDisabled,
}: {
	data: SecuritySMSNumber;
	onChange: ( value: Partial< SecuritySMSNumber > ) => void;
	isDisabled: boolean;
} ) {
	const { data: smsCountryCodes } = useSuspenseQuery( smsCountryCodesQuery() );

	const countryCodes =
		smsCountryCodes?.map( ( countryCode ) => ( {
			label: countryCode.name,
			value: countryCode.code,
		} ) ) ?? [];

	const onChangeCountryCode = ( value: string ) => {
		const countryCode = smsCountryCodes?.find( ( countryCode ) => countryCode.code === value );
		if ( ! countryCode ) {
			return;
		}

		return onChange( {
			...data,
			countryCode: countryCode.code,
			countryNumericCode: countryCode.numeric_code,
		} );
	};

	return (
		<HStack>
			<SelectControl
				label={ __( 'Country code' ) }
				value={ data.countryCode ?? '' }
				options={ countryCodes }
				onChange={ onChangeCountryCode }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				disabled={ isDisabled }
			/>
			<InputControl
				className="phone-number-input__number-input"
				__next40pxDefaultSize
				type="tel"
				label={ __( 'Phone number' ) }
				value={ data.phoneNumber ?? '' }
				onChange={ ( value ) => {
					return onChange( {
						...data,
						phoneNumber: value ?? '',
					} );
				} }
				disabled={ isDisabled }
			/>
		</HStack>
	);
}
