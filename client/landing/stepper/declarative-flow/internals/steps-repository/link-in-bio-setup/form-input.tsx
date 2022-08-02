/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FormInputValidation } from '@automattic/components';
import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';

type FormInputProps = {
	onChange: () => void;
	errorMessage: string;
	isValid: boolean;
	inputValue: string;
	label: string;
};

export const FormInput = ( {
	onChange,
	errorMessage,
	isValid,
	inputValue,
	label,
}: FormInputProps ) => {
	return (
		<div className="link-in-bio-setup-form__field">
			<label className="link-in-bio-setup-form__label">{ label }</label>
			<div
				className={ classNames( 'link-in-bio-setup-form__input', {
					error: ! isValid,
				} ) }
			>
				<input value={ inputValue } type="text" onChange={ onChange } />
				<div className="link-in-bio-setup-form-input__success">
					{ isValid && inputValue && <Icon fill={ 'green' } icon={ check } size={ 26 } /> }
				</div>
			</div>

			{ ! isValid && (
				<FormInputValidation isError={ true } isValid={ isValid } text={ errorMessage } />
			) }
		</div>
	);
};

export default FormInput;
