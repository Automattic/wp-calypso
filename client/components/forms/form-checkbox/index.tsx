import clsx from 'clsx';
import { InputHTMLAttributes, forwardRef } from 'react';

import './style.scss';

type CheckboxProps = InputHTMLAttributes< HTMLInputElement >;

const FormInputCheckbox = forwardRef< HTMLInputElement | null, CheckboxProps >(
	( { className, ...otherProps }, ref ) => (
		<input
			ref={ ref }
			{ ...otherProps }
			type="checkbox"
			className={ clsx( className, 'form-checkbox' ) }
		/>
	)
);

export default FormInputCheckbox;
