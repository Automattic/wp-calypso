/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import StartRedirect from 'reader/start/redirect';

const FollowingStream = ( props ) => {
	return (
		<div>
			<StartRedirect />
			<Stream { ...props } />
		</div>
	);
};

export default FollowingStream;
