import { FormInputValidation } from '@automattic/components';
import classnames from 'classnames';
import FormLabel from 'calypso/components/forms/form-label';
import PhoneInput from 'calypso/components/phone-input';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { FC, MutableRefObject } from 'react';

export type FormPhoneMediaValue = {
	value: string;
	countryCode: string;
};

export type FormPhoneMediaInputProps = {
	additionalClasses?: string;
	label: string;
	name?: string;
	value: FormPhoneMediaValue;
	className?: string;
	disabled?: boolean;
	errorMessage?: string;
	isError?: boolean;
	onChange: ( newValueAndCountry: FormPhoneMediaValue ) => void;
	countriesList: CountryListItem[];
	enableStickyCountry?: boolean;
	inputRef?: MutableRefObject< HTMLInputElement | undefined >;
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
		<div className={ classnames( additionalClasses, 'phone' ) }>
			<div>
				<FormLabel htmlFor={ name }>{ label }</FormLabel>
				<PhoneInput
					inputRef={ inputRef }
					name={ name }
					onChange={ onChange }
					value={ { value: value.value, countryCode: value.countryCode.toUpperCase() } }
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
