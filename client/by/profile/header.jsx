/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import userFactory from 'lib/user';
import userSettings from 'lib/user-settings';

const ProfileHeader = ( { description, moment, translate, user } ) => (
	<div className="profile__header">
		<div className="profile__banner">
			<Gravatar
				size={ 300 }
				user={ user } />
			<h1 className="profile__display-name">{ user.display_name }</h1>
			<p className="profile__member-since">{ translate( 'member since' ) }
				&nbsp;{ moment( user.date ).format( 'YYYY' ) }</p>
		</div>

		<div className="profile__about-me">
			<p>{ description }</p>
		</div>
	</div>
);

ProfileHeader.propTypes = {
	description: PropTypes.string,
	moment: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	user: PropTypes.object.isRequired
};

const mapStateToProps = () => ( {
	description: userSettings.getSetting( 'description' ),
	user: userFactory().get()
} );

export default connect( mapStateToProps )( localize( ProfileHeader ) );
