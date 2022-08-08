/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FormInputValidation } from '@automattic/components';
import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';

type LinkInBioInputProps = {
	onChange: ( e: React.ChangeEvent< HTMLInputElement > ) => void;
	errorMessage: string;
	isValid: boolean;
	inputValue: string;
	label: string;
	inputId: string;
	disabled: boolean;
};

export const LinkInBioInput = ( {
	onChange,
	errorMessage,
	isValid,
	inputValue,
	label,
	inputId,
	disabled,
}: LinkInBioInputProps ) => {
	return (
		<div className="link-in-bio-setup-form__field">
			<FormFieldset disabled={ disabled } className="site-options__form-fieldset">
				<FormLabel htmlFor={ inputId }>{ label }</FormLabel>
				<div
					className={ classNames( 'link-in-bio-setup-form__input', {
						error: ! isValid,
					} ) }
				>
					<FormInput
						name={ inputId }
						id={ inputId }
						value={ inputValue }
						isError={ isValid }
						isValid={ isValid }
						onChange={ onChange }
					/>
					<div className="link-in-bio-setup-form-input__success">
						{ isValid && inputValue && <Icon fill={ 'green' } icon={ check } size={ 26 } /> }
					</div>
				</div>
				{ ! isValid && inputValue && <FormInputValidation isError text={ errorMessage } /> }
			</FormFieldset>
		</div>
	);
};

export default LinkInBioInput;
