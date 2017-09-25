/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';

const FieldError = ( { text, type = 'input-validation' } ) => {
	return (
		<div className={ classNames(
			'field-error',
			`field-error__${ type }`
		) }>
			<Gridicon size={ 24 } icon="notice-outline" /> <span>{ text }</span>
		</div>
	);
};

FieldError.propTypes = {
	text: PropTypes.string.isRequired,
	type: PropTypes.string,
};

export default FieldError;
