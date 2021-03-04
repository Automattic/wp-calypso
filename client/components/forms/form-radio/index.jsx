/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { isNullish } from 'calypso/lib/js-utils';

import './style.scss';

const FormRadio = ( { className, label, ...otherProps } ) => (
	<>
		<input { ...otherProps } type="radio" className={ classnames( className, 'form-radio' ) } />
		{ ! isNullish( label ) && <span className="form-radio__label">{ label }</span> }
	</>
);

export default FormRadio;
