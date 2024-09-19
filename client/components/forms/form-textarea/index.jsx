import clsx from 'clsx';

import './style.scss';

const FormTextarea = ( {
	className = '',
	isError = false,
	isValid = false,
	children = undefined,
	forwardedRef = undefined,
	...otherProps
} ) => (
	<textarea
		{ ...otherProps }
		className={ clsx( className, 'form-textarea', {
			'is-error': isError,
			'is-valid': isValid,
		} ) }
		ref={ forwardedRef }
	>
		{ children }
	</textarea>
);

export default FormTextarea;
