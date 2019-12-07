/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Toggle from 'components/forms/form-toggle';

/**
 * Style dependencies
 */
import './compact.scss';

const CompactFormToggle = ( { className, children, ...otherProps } ) => (
	<Toggle { ...otherProps } className={ classNames( className, 'is-compact' ) }>
		{ children }
	</Toggle>
);

export default CompactFormToggle;
