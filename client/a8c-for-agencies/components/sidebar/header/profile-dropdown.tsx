import { Button, Gridicon, Gravatar } from '@automattic/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import { isClientView } from 'calypso/a8c-for-agencies/sections/purchases/payment-methods/lib/is-client-view';
import useOutsideClickCallback from 'calypso/lib/use-outside-click-callback';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { CONTACT_URL_HASH_FRAGMENT } from '../../a4a-contact-support-widget';
import { PROVIDE_FEEDBACK_URL_HASH_FRAGMENT } from '../../a4a-feedback/provide-feedback';
import {
	EXTERNAL_A4A_KNOWLEDGE_BASE,
	EXTERNAL_A4A_CLIENT_KNOWLEDGE_BASE,
	EXTERNAL_WPCOM_ACCOUNT_URL,
} from '../../sidebar-menu/lib/constants';

import './style.scss';

type DropdownMenuProps = {
	isExpanded: boolean;
	setMenuExpanded: ( isExpanded: boolean ) => void;
};
const DropdownMenu = ( { isExpanded, setMenuExpanded }: DropdownMenuProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onGetHelp = useCallback( () => {
		setMenuExpanded( false );
		dispatch( recordTracksEvent( 'calypso_a4a_sidebar_gethelp' ) );
	}, [ dispatch, setMenuExpanded ] );

	const onProvideFeedback = useCallback( () => {
		setMenuExpanded( false );
		dispatch( recordTracksEvent( 'calypso_a4a_sidebar_provide_feedback' ) );
	}, [ dispatch, setMenuExpanded ] );

	const onSignOut = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_sidebar_signout' ) );
		dispatch( redirectToLogout() );
	}, [ dispatch ] );

	const isClient = isClientView();

	return (
		<ul className="a4a-sidebar__profile-dropdown-menu" hidden={ ! isExpanded }>
			{
				// Show the "Contact support" button if the user is not a client
				! isClient && (
					<>
						<li className="a4a-sidebar__profile-dropdown-menu-item">
							<Button
								borderless
								onClick={ onProvideFeedback }
								href={ PROVIDE_FEEDBACK_URL_HASH_FRAGMENT }
							>
								{ translate( 'Provide feedback' ) }
							</Button>
						</li>
						<li className="a4a-sidebar__profile-dropdown-menu-item">
							<Button borderless onClick={ onGetHelp } href={ CONTACT_URL_HASH_FRAGMENT }>
								{ translate( 'Contact support' ) }
							</Button>
						</li>
					</>
				)
			}
			<li className="a4a-sidebar__profile-dropdown-menu-item">
				<Button
					borderless
					href={ isClient ? EXTERNAL_A4A_CLIENT_KNOWLEDGE_BASE : EXTERNAL_A4A_KNOWLEDGE_BASE }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ translate( 'View Knowledge Base' ) } <Gridicon icon="external" size={ 18 } />
				</Button>
			</li>
			<li className="a4a-sidebar__profile-dropdown-menu-item">
				<Button
					borderless
					href={ EXTERNAL_WPCOM_ACCOUNT_URL }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ translate( 'Manage your profile' ) } <Gridicon icon="external" size={ 18 } />
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
			className={ clsx( 'a4a-sidebar__profile-dropdown', `is-align-menu-${ dropdownPosition }` ) }
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
						<span className="a4a-sidebar__profile-dropdown-button-label-text">
							{ user?.display_name }
						</span>
						<Icon icon={ chevronDown } />
					</div>
				) }
			</Button>
			<DropdownMenu isExpanded={ isMenuExpanded } setMenuExpanded={ setMenuExpanded } />
		</nav>
	);
};

export default ProfileDropdown;
