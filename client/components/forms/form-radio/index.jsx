/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';
import { isNil } from 'lodash';

import './style.scss';

const FormRadio = ( { className, label, ...otherProps } ) => (
	<>
		<input { ...otherProps } type="radio" className={ classnames( className, 'form-radio' ) } />
		{ ! isNil( label ) && <span className="form-radio__label">{ label }</span> }
	</>
);

export default FormRadio;
