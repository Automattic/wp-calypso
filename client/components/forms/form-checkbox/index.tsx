import classnames from 'classnames';
import { FunctionComponent, InputHTMLAttributes } from 'react';

import './style.scss';

type CheckboxProps = InputHTMLAttributes< HTMLInputElement >;

const FormInputCheckbox: FunctionComponent< CheckboxProps > = ( { className, ...otherProps } ) => (
	<input { ...otherProps } type="checkbox" className={ classnames( className, 'form-checkbox' ) } />
);

export default FormInputCheckbox;
