/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import GridiconNoticeOutline from 'gridicons/dist/notice-outline';

const FieldError = ( { text, type = 'input-validation' } ) => {
	return (
		<div className={ classNames( 'field-error', `field-error__${ type }` ) }>
			<GridiconNoticeOutline size={ 24 } /> <span>{ text }</span>
		</div>
	);
};

FieldError.propTypes = {
	text: PropTypes.string.isRequired,
	type: PropTypes.string,
};

export default FieldError;
