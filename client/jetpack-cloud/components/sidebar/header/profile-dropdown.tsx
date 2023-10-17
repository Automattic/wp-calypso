import { Button, Gravatar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useOutsideClickCallback from './use-outside-click-callback';

import './style.scss';

type DropdownMenuProps = {
	isExpanded: boolean;
};
const DropdownMenu = ( { isExpanded }: DropdownMenuProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onGetHelp = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_gethelp' ) );
	}, [ dispatch ] );
	const onSignOut = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_signout' ) );
		dispatch( redirectToLogout() );
	}, [ dispatch ] );

	return (
		<ul className="jetpack-cloud-sidebar__profile-dropdown-menu" hidden={ ! isExpanded }>
			<li className="jetpack-cloud-sidebar__profile-dropdown-menu-item">
				<Button
					borderless
					href="https://jetpack.com/support"
					rel="noreferrer"
					target="_blank"
					onClick={ onGetHelp }
				>
					{ translate( 'Get help' ) }
				</Button>
			</li>
			<li className="jetpack-cloud-sidebar__profile-dropdown-menu-item">
				<Button borderless onClick={ onSignOut }>
					{ translate( 'Sign out' ) }
				</Button>
			</li>
		</ul>
	);
};

const ProfileDropdown = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const user = useSelector( getCurrentUser );

	const [ isMenuExpanded, setMenuExpanded ] = useState( false );
	const onToggleMenu = useCallback( () => {
		setMenuExpanded( ( current ) => ! current );
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_profile_toggle' ) );
	}, [ dispatch ] );
	const onCloseMenu = useCallback( () => {
		if ( ! isMenuExpanded ) {
			return;
		}

		setMenuExpanded( false );
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_profile_close' ) );
	}, [ dispatch, isMenuExpanded ] );

	const dropdownRef = useRef( null );
	useOutsideClickCallback( dropdownRef, onCloseMenu );

	return (
		<nav
			ref={ dropdownRef }
			className="jetpack-cloud-sidebar__profile-dropdown"
			aria-label={
				translate( 'User menu', {
					comment: 'Label used to differentiate navigation landmarks in screen readers',
				} ) as string
			}
		>
			<Button
				borderless
				className="jetpack-cloud-sidebar__profile-dropdown-button"
				onClick={ onToggleMenu }
				aria-expanded={ isMenuExpanded }
				aria-controls="menu-list"
			>
				<Gravatar
					className="jetpack-cloud-sidebar__profile-dropdown-button-icon"
					user={ user }
					size={ 32 }
					alt={ translate( 'My Profile', { textOnly: true } ) }
				/>
			</Button>
			<DropdownMenu isExpanded={ isMenuExpanded } />
		</nav>
	);
};

export default ProfileDropdown;
