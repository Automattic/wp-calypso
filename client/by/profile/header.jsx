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

const ProfileHeader = ( { moment, translate, user } ) => (
	<div className="profile__header">
		<Gravatar
			imgSize="96"
			size="96"
			user={ user } />
		<h1>{ user.display_name }</h1>
		<p>{ translate( 'Since' ) } { moment( user.date ).fromNow( true ) }</p>
	</div>
);

ProfileHeader.propTypes = {
	moment: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	user: PropTypes.object.isRequired
};

const mapStateToProps = () => ( {
	user: userFactory().get()
} );

export default connect( mapStateToProps )( localize( ProfileHeader ) );
