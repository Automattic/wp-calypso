/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import Toggle from 'components/forms/form-toggle';

const CompactFormToggle = ( { className, children, ...otherProps } ) => (
	<Toggle { ...otherProps }
		className={ classNames( className, 'is-compact' ) }
	>
		{ children }
	</Toggle>
);

export default CompactFormToggle;
