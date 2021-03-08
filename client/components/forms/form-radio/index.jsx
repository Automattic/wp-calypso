/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';
import { isNullish } from '@automattic/js-utils';

import './style.scss';

const FormRadio = ( { className, label, ...otherProps } ) => (
	<>
		<input { ...otherProps } type="radio" className={ classnames( className, 'form-radio' ) } />
		{ ! isNullish( label ) && <span className="form-radio__label">{ label }</span> }
	</>
);

export default FormRadio;
