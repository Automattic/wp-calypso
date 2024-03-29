import classNames from 'classnames';
import PropTypes from 'prop-types';

import './style.scss';

function FormSettingExplanation( {
	className = '',
	noValidate = false,
	isIndented = false,
	...rest
} ) {
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
