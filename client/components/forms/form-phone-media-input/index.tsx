import classnames from 'classnames';
import { ReactNode, RefObject } from 'react';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import PhoneInput from 'calypso/components/phone-input';

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
	onChange: ( _: { value: string; countryCode: string } ) => void;
	countriesList: { code: string; name: string }[];
	enableStickyCountry?: boolean;
	inputRef?: RefObject< HTMLInputElement >;
	children: ReactNode;
};

export default function FormPhoneMediaInput( {
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
}: FormPhoneMediaInputProps ): JSX.Element {
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
}
