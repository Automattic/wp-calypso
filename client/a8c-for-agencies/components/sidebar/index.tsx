import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import { Icon, starEmpty } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { isClientView } from 'calypso/a8c-for-agencies/sections/purchases/payment-methods/lib/is-client-view';
import JetpackIcons from 'calypso/components/jetpack/jetpack-icons';
import Sidebar, {
	SidebarV2Main as SidebarMain,
	SidebarV2Footer as SidebarFooter,
	SidebarNavigator,
	SidebarNavigatorMenu,
	SidebarNavigatorMenuItem,
} from 'calypso/layout/sidebar-v2';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import A4AContactSupportWidget, { CONTACT_URL_HASH_FRAGMENT } from '../a4a-contact-support-widget';
import ProvideFeedback from '../a4a-feedback/provide-feedback';
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

	const isClient = isClientView();
	const isNarrowView = useBreakpoint( '<660px' );

	const onShowUserSupportForm = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_share_product_feedback_click' ) );
	}, [ dispatch ] );

	const contactUsText = isClient
		? translate( 'Contact support' )
		: translate( 'Contact sales & support' );

	// When the sidebar is not displayed (narrow view), we need to set the layout focus to the preview.
	// This is because, on a narrow view, we want to display the sidebar to navigate to all available pages
	// rather than showing the default page of the nested sidebar directly.
	useEffect( () => {
		if ( path && isNarrowView ) {
			dispatch( setLayoutFocus( 'preview' ) );
		}
	}, [ dispatch, path, isNarrowView ] );

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
								page( CONTACT_URL_HASH_FRAGMENT );
								dispatch(
									recordTracksEvent( 'calypso_a4a_sidebar_menu_click', {
										menu_item: 'A4A / Support',
									} )
								);
							} }
						/>
					) }

					<SidebarNavigatorMenuItem
						title={ contactUsText }
						link={ CONTACT_URL_HASH_FRAGMENT }
						path=""
						icon={ <Icon icon={ starEmpty } /> }
						onClickMenuItem={ onShowUserSupportForm }
					/>

					{ withUserProfileFooter && <ProfileDropdown dropdownPosition="up" /> }
				</ul>
			</SidebarFooter>

			<A4AContactSupportWidget />
			<ProvideFeedback />
		</Sidebar>
	);
};

export default A4ASidebar;
