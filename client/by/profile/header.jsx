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
		<div className="profile__banner">
			<Gravatar
				size={ 96 }
				user={ user } />
			<h1>{ user.display_name }</h1>
			<p>@{ user.username }, { translate( 'member since' ) } { moment( user.date ).fromNow( true ) }</p>
		</div>

		<div className="profile__about-me">
			<p>Hi! I'm Marigold the goat. I like eating and pooping.
				Sometimes I poop when I eat. Don't impose your human standards on me!
				I'm a goat and I DGAF!</p>
		</div>
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
