/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

const ProfileHeader = ( { username } ) => (
	<div className="profile__header">
		<h1>{ username }</h1>
	</div>
);

ProfileHeader.propTypes = {
	username: PropTypes.string.isRequired
};

export default ProfileHeader;
