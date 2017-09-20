/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import FollowingIntro from './intro';
import config from 'config';

const FollowingStream = props => {
	return (
		<Stream { ...props }>
			{ config.isEnabled( 'reader/following-intro' ) && <FollowingIntro /> }
		</Stream>
	);
};

export default localize( FollowingStream );
