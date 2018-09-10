/** @format */

/* eslint-disable wpcalypso/jsx-gridicon-size */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import GridiconMinusSmall from 'gridicons/dist/minus-small';
import GridiconCheckmark from 'gridicons/dist/checkmark';
import { omit } from 'lodash';

const Checkbox = props => {
	const { className, disabled, checked, partialChecked } = props;
	const otherProps = omit( props, [ 'className', 'partialChecked' ] );

	return (
		<span className={ classNames( className, 'form-checkbox', { 'is-disabled': disabled } ) }>
			<input { ...otherProps } type="checkbox" />
			{ checked && <GridiconCheckmark size={ 14 } /> }
			{ ! checked && partialChecked && <GridiconMinusSmall size={ 16 } /> }
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
