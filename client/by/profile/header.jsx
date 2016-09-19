/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

const ProfileHeader = ( { username } ) => (
	<div className="profile__header">
		<img className="profile__gravatar" src="/calypso/images/people/mystery-person.svg" alt="{ username }" />
		<h1>Public Display Name</h1>
		<h2>@{ username }, member since 2006</h2>
	</div>
);

ProfileHeader.propTypes = {
	username: PropTypes.string.isRequired
};

export default ProfileHeader;
