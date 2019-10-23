/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

type Props = Omit< React.ComponentPropsWithoutRef< 'input' >, 'type' >;

const FormInputCheckbox: React.FunctionComponent< Props > = ( { className, ...otherProps } ) => (
	<input { ...otherProps } type="checkbox" className={ classnames( className, 'form-checkbox' ) } />
);

export default FormInputCheckbox;
