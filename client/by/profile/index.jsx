/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import ProfileHeader from './header';
import ProfileSites from './sites';
import QuerySites from 'components/data/query-sites';

const Profile = ( { username } ) => (
	<div className="profile">
		<QuerySites allSites />

		<ProfileHeader
			username={ username } />
		<ProfileSites
			username={ username } />
	</div>
);

Profile.propTypes = {
	username: PropTypes.string.isRequired
};

export default Profile;
