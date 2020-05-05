/* eslint-disable wpcalypso/jsx-gridicon-size */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { omit } from 'lodash';

const Checkbox = ( props ) => {
	const { className, disabled, checked, partialChecked } = props;
	const otherProps = omit( props, [ 'className', 'partialChecked' ] );

	return (
		<span className={ classNames( className, 'form-checkbox', { 'is-disabled': disabled } ) }>
			<input { ...otherProps } type="checkbox" />
			{ checked && <Gridicon icon="checkmark" size={ 14 } /> }
			{ ! checked && partialChecked && <Gridicon icon="minus-small" size={ 16 } /> }
		</span>
	);
};

Checkbox.propTypes = {
	checked: PropTypes.bool.isRequired,
	partialChecked: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	className: PropTypes.string,
};

export default Checkbox;
