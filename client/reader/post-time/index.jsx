/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { PropTypes } from 'prop-types';

/**
 * Internal dependencies
 */
import TimeSince from 'components/time-since';

const PostTime = ( { className, date } ) => <TimeSince className={ className } date={ date } />;

PostTime.propTypes = {
	date: PropTypes.string.isRequired,
};

export default PostTime;
