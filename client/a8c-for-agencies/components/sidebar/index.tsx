import page from '@automattic/calypso-router';
import { Icon, starEmpty } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import UserContactSupportModalForm from 'calypso/a8c-for-agencies/components/user-contact-support-modal-form';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/sections/overview/sidebar/contact-support';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import Sidebar, {
	SidebarV2Main as SidebarMain,
	SidebarV2Footer as SidebarFooter,
	SidebarNavigator,
	SidebarNavigatorMenu,
	SidebarNavigatorMenuItem,
} from 'calypso/layout/sidebar-v2';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { A4A_OVERVIEW_LINK } from '../sidebar-menu/lib/constants';
import SidebarHeader from './header';
import ProfileDropdown from './header/profile-dropdown';

import './style.scss';

type Props = {
	className?: string;
	path: string;
	menuItems: {
		icon: JSX.Element;
		path: string;
		link: string;
		title: string;
		onClickMenuItem?: ( path: string ) => void;
		withChevron?: boolean;
		isExternalLink?: boolean;
		isSelected?: boolean;
		trackEventName?: string;
		trackEventProps?: { [ key: string ]: string };
	}[];
	title?: string;
	description?: string;
	backButtonProps?: {
		icon: JSX.Element;
		label: string;
		onClick: () => void;
	};
	withGetHelpLink?: boolean;
	withUserProfileFooter?: boolean;
};

const A4ASidebar = ( {
	className,
	path,
	menuItems,
	title,
	description,
	backButtonProps,
	withGetHelpLink,
	withUserProfileFooter,
}: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showUserSupportForm, setShowUserSupportForm ] = useState( false );

	const onShowUserSupportForm = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_share_product_feedback_click' ) );
		setShowUserSupportForm( true );
	}, [ dispatch ] );

	const onCloseUserSupportForm = useCallback( () => {
		// Remove any hash from the URL.
		history.pushState( null, '', window.location.pathname + window.location.search );
		setShowUserSupportForm( false );
	}, [] );

	return (
		<Sidebar className={ clsx( 'a4a-sidebar', className ) }>
			<SidebarHeader withProfileDropdown={ ! withUserProfileFooter } />

			<SidebarMain>
				<SidebarNavigator initialPath={ path }>
					<SidebarNavigatorMenu
						path={ path }
						title={ title }
						description={ description }
						backButtonProps={ backButtonProps }
					>
						{ menuItems.map( ( item ) => (
							<SidebarNavigatorMenuItem
								key={ item.link }
								{ ...item }
								onClickMenuItem={ ( path ) => {
									if ( item.trackEventName ) {
										dispatch( recordTracksEvent( item.trackEventName, item.trackEventProps ) );
									}

									item.onClickMenuItem?.( path );
								} }
							/>
						) ) }
					</SidebarNavigatorMenu>
				</SidebarNavigator>
			</SidebarMain>

			<SidebarFooter className="a4a-sidebar__footer">
				<ul>
					{ withGetHelpLink && (
						<SidebarNavigatorMenuItem
							title={ translate( 'Get help', {
								comment: 'A4A sidebar navigation item',
							} ) }
							link=""
							path=""
							icon={ <JetpackIcons icon="help" /> }
							onClickMenuItem={ () => {
								page( A4A_OVERVIEW_LINK + CONTACT_URL_HASH_FRAGMENT );
								dispatch(
									recordTracksEvent( 'calypso_a4a_sidebar_menu_click', {
										menu_item: 'A4A / Support',
									} )
								);
							} }
						/>
					) }

					<SidebarNavigatorMenuItem
						title={ translate( 'Contact sales', {
							comment: 'A4A sidebar navigation item',
						} ) }
						link={ A4A_OVERVIEW_LINK + '#contact-sales' }
						path=""
						icon={ <Icon icon={ starEmpty } /> }
						onClickMenuItem={ onShowUserSupportForm }
					/>

					{ withUserProfileFooter && <ProfileDropdown dropdownPosition="up" /> }
				</ul>
			</SidebarFooter>

			<UserContactSupportModalForm
				show={ showUserSupportForm }
				onClose={ onCloseUserSupportForm }
			/>
		</Sidebar>
	);
};

export default A4ASidebar;
