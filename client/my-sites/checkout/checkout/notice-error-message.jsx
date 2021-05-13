/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

const NoticeErrorMessage = ( { message } ) => <strong>{ message }</strong>;

NoticeErrorMessage.propTypes = {
	message: PropTypes.string,
};

NoticeErrorMessage.defaultProps = {
	message: '',
};

export default NoticeErrorMessage;
