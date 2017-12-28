/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Stream from 'client/reader/stream';

const TeamStream = props => {
	return <Stream { ...props } shouldCombineCards={ false } />;
};

export default TeamStream;
