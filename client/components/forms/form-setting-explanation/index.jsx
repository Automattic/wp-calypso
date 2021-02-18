/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

function FormSettingExplanation( { className, noValidate, isIndented, ...rest } ) {
	const classes = classNames( 'form-setting-explanation', className, {
		'no-validate': noValidate,
		'is-indented': isIndented,
	} );

	return <p { ...rest } className={ classes } />;
}

FormSettingExplanation.propTypes = {
	className: PropTypes.string,
	noValidate: PropTypes.bool,
	isIndented: PropTypes.bool,
};

export default FormSettingExplanation;
