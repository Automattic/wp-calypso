import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import Animate from 'calypso/components/animate';
import Gravatar from 'calypso/components/gravatar';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

import './style.scss';

// use imgSize = 400 for caching
// it's the popular value for large Gravatars in Calypso
const GRAVATAR_IMG_SIZE = 400;

export default function ProfileGravatar( { user, inSidebar } ) {
	const dispatch = useDispatch();

	// record clicks on non-interactive profile picture
	function recordGravatarMisclick() {
		dispatch( recordGoogleEvent( 'Me', 'Clicked on Unclickable Gravatar Image in Sidebar' ) );
	}

	return (
		<div className={ clsx( 'profile-gravatar', { 'is-in-sidebar': inSidebar } ) }>
			<div role="presentation" onClick={ recordGravatarMisclick }>
				<Animate type="appear">
					<Gravatar user={ user } size={ 150 } imgSize={ GRAVATAR_IMG_SIZE } />
				</Animate>
			</div>
			<h2 className="profile-gravatar__user-display-name">{ user.display_name }</h2>
			<div className="profile-gravatar__user-secondary-info">@{ user.username }</div>
		</div>
	);
}
