import { Button, Gravatar } from '@automattic/components';
import { Icon, chevronDown, external } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useOutsideClickCallback from '../use-outside-click-callback';

import './style.scss';

type DropdownMenuProps = {
	isExpanded: boolean;
};
const DropdownMenu = ( { isExpanded }: DropdownMenuProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onGetHelp = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_sidebar_gethelp' ) );
	}, [ dispatch ] );
	const onSignOut = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_sidebar_signout' ) );
		dispatch( redirectToLogout() );
	}, [ dispatch ] );

	return (
		<ul className="a4a-sidebar__profile-dropdown-menu" hidden={ ! isExpanded }>
			<li className="a4a-sidebar__profile-dropdown-menu-item">
				<Button
					className="a4a-sidebar__external-link"
					borderless
					href="https://agencies.automattic.com/support"
					rel="noreferrer"
					target="_blank"
					onClick={ onGetHelp }
				>
					{ translate( 'Get help' ) }
					<Icon icon={ external } size={ 24 } />
				</Button>
			</li>
			<li className="a4a-sidebar__profile-dropdown-menu-item">
				<Button borderless onClick={ onSignOut }>
					{ translate( 'Sign out' ) }
				</Button>
			</li>
		</ul>
	);
};

type ProfileDropdownProps = {
	compact?: boolean;
	dropdownPosition?: 'up' | 'down';
};

const ProfileDropdown = ( { compact, dropdownPosition = 'down' }: ProfileDropdownProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const user = useSelector( getCurrentUser );

	const [ isMenuExpanded, setMenuExpanded ] = useState( false );
	const onToggleMenu = useCallback( () => {
		setMenuExpanded( ( current ) => ! current );
		dispatch( recordTracksEvent( 'calypso_a4a_sidebar_profile_toggle' ) );
	}, [ dispatch ] );
	const onCloseMenu = useCallback( () => {
		if ( ! isMenuExpanded ) {
			return;
		}

		setMenuExpanded( false );
		dispatch( recordTracksEvent( 'calypso_a4a_sidebar_profile_close' ) );
	}, [ dispatch, isMenuExpanded ] );

	const dropdownRef = useRef( null );
	useOutsideClickCallback( dropdownRef, onCloseMenu );

	return (
		<nav
			ref={ dropdownRef }
			className={ classNames(
				'a4a-sidebar__profile-dropdown',
				`is-align-menu-${ dropdownPosition }`
			) }
			aria-label={
				translate( 'User menu', {
					comment: 'Label used to differentiate navigation landmarks in screen readers',
				} ) as string
			}
		>
			<Button
				borderless
				className="a4a-sidebar__profile-dropdown-button"
				onClick={ onToggleMenu }
				aria-expanded={ isMenuExpanded }
				aria-controls="menu-list"
			>
				<Gravatar
					className="a4a-sidebar__profile-dropdown-button-icon"
					user={ user }
					size={ 32 }
					alt={ translate( 'My Profile', { textOnly: true } ) }
				/>

				{ ! compact && (
					<div className="a4a-sidebar__profile-dropdown-button-label">
						{ user?.display_name } <Icon icon={ chevronDown } />
					</div>
				) }
			</Button>
			<DropdownMenu isExpanded={ isMenuExpanded } />
		</nav>
	);
};

export default ProfileDropdown;
