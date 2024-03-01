import classnames from 'classnames';
import { InputHTMLAttributes, forwardRef } from 'react';

import './style.scss';

type CheckboxProps = InputHTMLAttributes< HTMLInputElement >;

const FormInputCheckbox = forwardRef< HTMLInputElement | null, CheckboxProps >(
	( { className, ...otherProps }, ref ) => (
		<input
			ref={ ref }
			{ ...otherProps }
			type="checkbox"
			className={ classnames( className, 'form-checkbox' ) }
		/>
	)
);

export default FormInputCheckbox;
