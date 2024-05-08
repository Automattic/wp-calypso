import { FormInputValidation, FormLabel } from '@automattic/components';
import clsx from 'clsx';
import PhoneInput from 'calypso/components/phone-input';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { PhoneInputValue } from 'calypso/components/phone-input';
import type { FC, MutableRefObject, ReactNode } from 'react';

export type FormPhoneMediaInputProps = {
	additionalClasses?: string;
	label: string;
	name?: string;
	value: PhoneInputValue;
	className?: string;
	disabled?: boolean;
	errorMessage?: ReactNode;
	isError?: boolean;
	onChange: ( newValueAndCountry: PhoneInputValue ) => void;
	countriesList: CountryListItem[];
	enableStickyCountry?: boolean;
	inputRef?: MutableRefObject< HTMLInputElement | undefined >;
	children?: React.ReactNode;
};

const FormPhoneMediaInput: FC< FormPhoneMediaInputProps > = ( {
	additionalClasses,
	label,
	name,
	value,
	className,
	disabled,
	errorMessage,
	isError,
	onChange,
	countriesList,
	enableStickyCountry,
	inputRef,
	children,
} ) => {
	return (
		<div className={ clsx( additionalClasses, 'phone' ) }>
			<div>
				<FormLabel htmlFor={ name }>{ label }</FormLabel>
				<PhoneInput
					inputRef={ inputRef }
					name={ name }
					onChange={ onChange }
					value={ { phoneNumber: value.phoneNumber, countryCode: value.countryCode.toUpperCase() } }
					countriesList={ countriesList }
					enableStickyCountry={ enableStickyCountry }
					className={ className }
					isError={ isError }
					disabled={ disabled }
				/>
				{ children }
			</div>
			{ errorMessage && <FormInputValidation text={ errorMessage } isError /> }
		</div>
	);
};

export default FormPhoneMediaInput;
