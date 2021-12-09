import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useOutsideClickCallback from './use-outside-click-callback';
import type { UserData } from 'calypso/lib/user/user';

import './style.scss';

const ProfileDropdown: React.FC = () => {
	const dispatch = useDispatch();
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
	const redirectToLogoutUrl = useCallback( () => dispatch( redirectToLogout() ), [ dispatch ] );
	const trackedLogOut = useTrackCallback(
		redirectToLogoutUrl,
		'calypso_jetpack_settings_masterbar_logout'
	);

	useOutsideClickCallback( ref, trackedClose );

	return (
		<nav
			className="profile-dropdown__nav"
			id="user-navigation"
			aria-label={
				translate( 'User menu', {
					comment: 'Label used to differentiate navigation landmarks in screen readers',
				} ) as string
			}
			ref={ ref }
		>
			<button
				className="profile-dropdown__button"
				aria-expanded={ isExpanded }
				aria-controls="menu-list"
				onClick={ trackedToggle }
			>
				<Gravatar
					className="profile-dropdown__button-gravatar"
					user={ user }
					alt={ translate( 'My Profile', { textOnly: true } ) }
					size={ 24 }
				/>
			</button>
			<ul className="profile-dropdown__list" id="menu-list" hidden={ ! isExpanded }>
				<li className="profile-dropdown__list-item">
					<span className="profile-dropdown__display-name">{ user.display_name }</span>
					<span className="profile-dropdown__username">{ `@${ user.username }` }</span>
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
