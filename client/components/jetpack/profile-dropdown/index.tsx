/**
 * External dependencies
 */
import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import useOutsideClickCallback from './use-outside-click-callback';
import Gravatar from 'calypso/components/gravatar';
import userUtilities from 'calypso/lib/user/utils';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';

/**
 * Type dependencies
 */
import type { UserData } from 'calypso/lib/user/user';

/**
 * Style dependencies
 */
import './style.scss';

const ProfileDropdown: React.FC = () => {
	const translate = useTranslate();
	const ref = React.useRef( null );
	const [ isExpanded, setExpanded ] = useState( false );
	const user = useSelector( getCurrentUser ) as UserData;

	const toggle = useCallback( () => setExpanded( ! isExpanded ), [ isExpanded, setExpanded ] );
	const close = useCallback( () => {
		if ( isExpanded ) {
			setExpanded( false );
		}
	}, [ isExpanded, setExpanded ] );

	const trackedToggle = useTrackCallback( toggle, 'calypso_jetpack_masterbar_profile_toggle' );
	const trackedClose = useTrackCallback( close, 'calypso_jetpack_masterbar_profile_close' );
	const trackedLogOut = useTrackCallback(
		userUtilities.logout,
		'calypso_jetpack_settings_masterbar_logout'
	);

	useOutsideClickCallback( ref, trackedClose );

	return (
		<nav className="profile-dropdown__nav" id="user-navigation" ref={ ref }>
			<button
				className="profile-dropdown__button"
				aria-expanded={ isExpanded }
				aria-controls="menu-list"
				onClick={ trackedToggle }
			>
				<Gravatar
					className="profile-dropdown__button-gravatar"
					user={ user }
					alt={ translate( 'My Profile' ) }
					size={ 18 }
				/>
			</button>
			<ul className="profile-dropdown__list" id="menu-list" hidden={ ! isExpanded }>
				<li className="profile-dropdown__list-item">
					<Gravatar className="profile-dropdown__list-gravatar" user={ user } alt="" size={ 64 } />
					{ translate( 'Logged in as {{username}}%s{{/username}}', {
						args: user.username,
						components: { username: <span className="profile-dropdown__username" /> },
					} ) }
				</li>
				<li className="profile-dropdown__list-item">
					<button className="profile-dropdown__logout" onClick={ trackedLogOut }>
						{ translate( 'Log out' ) }
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default ProfileDropdown;
