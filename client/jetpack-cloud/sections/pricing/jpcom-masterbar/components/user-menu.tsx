import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import Gravatar from 'calypso/components/gravatar';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn, getCurrentUser } from 'calypso/state/current-user/selectors';
import type { UserData } from 'calypso/lib/user/user';
import type { MouseEvent as ReactMouseEvent, FC } from 'react';

interface MenuButtonProps {
	isMenuOpen: boolean;
	user: UserData | null;
	toggleUserMenu: () => void;
}

interface ProfileProps {
	isMenuOpen: boolean;
	user: UserData | null;
	toggleUserMenu: () => void;
}

interface TooltipProps {
	user: UserData | null;
}

const MenuButton: FC< MenuButtonProps > = ( { isMenuOpen, user, toggleUserMenu } ) => {
	const onUserBtnClick = ( e: ReactMouseEvent< HTMLAnchorElement, MouseEvent > ) => {
		e.preventDefault();
		e.stopPropagation();

		toggleUserMenu();
	};

	return (
		<a
			className="user-menu__btn js-user-menu-btn"
			href="#profile"
			onClick={ onUserBtnClick }
			aria-expanded={ isMenuOpen }
		>
			<Gravatar user={ user } className="user-menu__avatar" />
		</a>
	);
};

const Tooltip: FC< TooltipProps > = ( { user } ) => {
	const locale = useLocale();
	const translate = useTranslate();

	return (
		<div className="tooltip">
			<span className="user-menu__greetings">
				{ translate( 'Hi, %s!', {
					args: user?.display_name || user?.username,
				} ) }
			</span>
			<ul className="user-menu__list">
				<li>
					<a className="js-manage-sites" href={ localizeUrl( '/', locale ) }>
						{ translate( 'Manage your sites' ) }
					</a>
				</li>
			</ul>
		</div>
	);
};

const Profile: FC< ProfileProps > = ( { isMenuOpen, user, toggleUserMenu } ) => (
	<div
		id="profile"
		className="user-menu__tooltip js-user-menu js"
		hidden={ ! isMenuOpen }
		onBlur={ toggleUserMenu }
	>
		<Tooltip user={ user } />
	</div>
);

const UserMenu: FC = () => {
	const locale = useLocale();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const user = useSelector( getCurrentUser );
	const translate = useTranslate();
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );

	const onDocumentClick = () => {
		setIsMenuOpen( false );
	};

	const toggleUserMenu = useCallback( () => {
		if ( isMenuOpen ) {
			document.removeEventListener( 'click', onDocumentClick );
		} else {
			document.addEventListener( 'click', onDocumentClick );
		}

		setIsMenuOpen( ( open ) => ! open );
	}, [ isMenuOpen ] );

	return (
		<ul className="header__actions-list">
			<li
				className={ clsx( 'header__user-menu user-menu ', {
					'is-logged-in': isLoggedIn,
				} ) }
			>
				{ isLoggedIn ? (
					<>
						<MenuButton isMenuOpen={ isMenuOpen } user={ user } toggleUserMenu={ toggleUserMenu } />
						<Profile isMenuOpen={ isMenuOpen } user={ user } toggleUserMenu={ toggleUserMenu } />
					</>
				) : (
					<a className="header__action-link js-login" href={ localizeUrl( '/login/', locale ) }>
						{ translate( 'Log in' ) }
					</a>
				) }
			</li>
		</ul>
	);
};

export default UserMenu;
