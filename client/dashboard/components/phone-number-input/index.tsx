import { smsCountryCodesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack, privateApis, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';

import './style.scss';

export type SecuritySMSNumber = {
	phoneNumber: string;
	countryCode: string;
	countryNumericCode: string;
};

export default function PhoneNumberInput( {
	data,
	onChange,
	isDisabled = false,
	customValidity,
}: {
	data: SecuritySMSNumber;
	onChange: ( value: Partial< SecuritySMSNumber > ) => void;
	isDisabled?: boolean;
	customValidity?: {
		type: 'invalid';
		message: string;
	};
} ) {
	const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
		'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
		'@wordpress/components'
	);
	const { ValidatedInputControl } = unlock( privateApis );
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
		<HStack className="phone-number-input">
			<SelectControl
				label={ __( 'Country code' ) }
				value={ data.countryCode ?? '' }
				options={ countryCodes }
				onChange={ onChangeCountryCode }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				disabled={ isDisabled }
				className="phone-number-input__country-code-input"
			/>
			<ValidatedInputControl
				customValidity={ customValidity }
				__next40pxDefaultSize
				type="tel"
				label={ __( 'Phone number' ) }
				value={ data.phoneNumber ?? '' }
				onChange={ ( value: string | undefined ) => {
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
