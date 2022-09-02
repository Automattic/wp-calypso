import { FormInputValidation } from '@automattic/components';
import classnames from 'classnames';
import FormLabel from 'calypso/components/forms/form-label';
import PhoneInput from 'calypso/components/phone-input';
import type { FC, RefObject } from 'react';

type FormPhoneMediaInputProps = {
	additionalClasses?: string[];
	label: string;
	name?: string;
	value: string;
	countryCode: string;
	className?: string;
	disabled?: boolean;
	errorMessage?: string;
	isError?: boolean;
	// TODO: Change value to include both values to match OnFieldChange; then change all implementations
	onChange: ( _: { value: string; countryCode: string } ) => void;
	countriesList: { code: string; name: string }[];
	enableStickyCountry?: boolean;
	inputRef?: RefObject< HTMLInputElement >;
};

const FormPhoneMediaInput: FC< FormPhoneMediaInputProps > = ( {
	additionalClasses,
	label,
	name,
	value,
	countryCode,
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
					value={ value }
					countriesList={ countriesList }
					enableStickyCountry={ enableStickyCountry }
					countryCode={ countryCode.toUpperCase() }
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
