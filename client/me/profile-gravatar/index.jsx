/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Animate from 'calypso/components/animate';
import Gravatar from 'calypso/components/gravatar';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

// use imgSize = 400 for caching
// it's the popular value for large Gravatars in Calypso
const GRAVATAR_IMG_SIZE = 400;

// Action creator to record clicks on non-interactive profile picture
function recordGravatarMisclick() {
	return recordGoogleEvent( 'Me', 'Clicked on Unclickable Gravatar Image in Sidebar' );
}

function ProfileGravatar( props ) {
	const parentClassName = [ 'profile-gravatar', props.inSidebar ? 'is-in-sidebar' : '' ].join(
		' '
	);

	return (
		<div className={ parentClassName }>
			<div role="presentation" onClick={ props.recordGravatarMisclick }>
				<Animate type="appear">
					<Gravatar user={ props.user } size={ 150 } imgSize={ GRAVATAR_IMG_SIZE } />
				</Animate>
			</div>
			<h2 className="profile-gravatar__user-display-name">{ props.user.display_name }</h2>
			<div className="profile-gravatar__user-secondary-info">@{ props.user.username }</div>
		</div>
	);
}

export default connect( null, { recordGravatarMisclick } )( ProfileGravatar );
