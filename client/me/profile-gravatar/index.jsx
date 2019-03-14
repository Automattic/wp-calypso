/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Animate from 'components/animate';
import Gravatar from 'components/gravatar';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

// use imgSize = 400 for caching
// it's the popular value for large Gravatars in Calypso
const GRAVATAR_IMG_SIZE = 400;

function recordGravatarMisclick() {
	return recordGoogleEvent( 'Me', 'Clicked on Unclickable Gravatar Image in Sidebar' );
}

function ProfileGravatar( props ) {
	/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
	return (
		<div className="profile-gravatar">
			<div onClick={ props.recordGravatarMisclick }>
				<Animate type="appear">
					<Gravatar user={ props.user } size={ 150 } imgSize={ GRAVATAR_IMG_SIZE } />
				</Animate>
			</div>
			<h2 className="profile-gravatar__user-display-name">{ props.user.display_name }</h2>
			<div className="profile-gravatar__user-secondary-info">@{ props.user.username }</div>
		</div>
	);
	/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
}

export default connect(
	null,
	{ recordGravatarMisclick }
)( ProfileGravatar );
