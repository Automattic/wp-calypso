/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

const ProfileHeader = ( { username } ) => (
	<div className="profile__header">

		<div className="profile__banner">
			<img className="profile__gravatar" src="/calypso/images/people/mystery-person.svg" alt="{ username }" />
			<h1>Public Display Name</h1>
			<h2>@{ username }, member since 2006</h2>
		</div>

		<div className="profile__about-me">
			<p>Hi! I'm Marigold the goat. I like eating and pooping. Sometimes I poop when I eat. Don't impose your human standards on me! I'm a goat and I DGAF!</p>
		</div>
	</div>
);

ProfileHeader.propTypes = {
	username: PropTypes.string.isRequired
};

export default ProfileHeader;
