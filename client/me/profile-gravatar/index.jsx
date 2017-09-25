/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Animate from 'components/animate';
import Gravatar from 'components/gravatar';
import { recordGoogleEvent } from 'state/analytics/actions';

class ProfileGravatar extends Component {

	recordGravatarMisclick = () => {
		this.props.recordGoogleEvent( 'Me',
			'Clicked on Unclickable Gravatar Image in Sidebar'
		);
	};

	render() {
		// use imgSize = 400 for caching
		// it's the popular value for large Gravatars in Calypso
		const GRAVATAR_IMG_SIZE = 400;

		return (
			<div className="profile-gravatar">
				<div onClick={ this.recordGravatarMisclick }>
					<Animate type="appear">
						<Gravatar
							user={ this.props.user }
							size={ 150 }
							imgSize={ GRAVATAR_IMG_SIZE }
						/>
					</Animate>
				</div>
				<h2 className="profile-gravatar__user-display-name">
					{ this.props.user.display_name }
				</h2>
				<div className="profile-gravatar__user-secondary-info">
					@{ this.props.user.username }
				</div>
			</div>
		);
	}
}

export default connect( null, {
	recordGoogleEvent
} )( localize( ProfileGravatar ) );
