import { Icon, starEmpty } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import Sidebar, {
	SidebarV2Main as SidebarMain,
	SidebarV2Footer as SidebarFooter,
	SidebarNavigator,
	SidebarNavigatorMenu,
	SidebarNavigatorMenuItem,
} from 'calypso/layout/sidebar-v2';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import getJetpackAdminUrl from 'calypso/state/sites/selectors/get-jetpack-admin-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import UserFeedbackModalForm from '../user-feedback-modal-form';
import SidebarHeader from './header';
import JetpackCloudSiteSelector from './site-selector';

import './style.scss';

type Props = {
	className?: string;
	isJetpackManage?: boolean;
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
	defaultSelectedMenuItem?: string;
};

const USER_FEEDBACK_FORM_URL_HASH = '#product-feedback';

const JetpackCloudSidebar = ( {
	className,
	isJetpackManage,
	path,
	menuItems,
	title,
	description,
	backButtonProps,
	defaultSelectedMenuItem,
}: Props ) => {
	const isAgency = useSelector( isAgencyUser );
	const siteId = useSelector( getSelectedSiteId );
	const jetpackAdminUrl = useSelector( ( state ) =>
		siteId ? getJetpackAdminUrl( state, siteId ) : null
	);

	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedMenuItem, setSelectedMenuItem ] = useState< string | null >( null );

	const selectMenuItem = ( link: string ) => {
		setSelectedMenuItem( link );
	};

	// Determine whether to initially show the user feedback form.
	const [ showUserFeedbackForm, setShowUserFeedbackForm ] = useState( false );

	const onShareProductFeedback = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_share_product_feedback_click' ) );
		selectMenuItem( USER_FEEDBACK_FORM_URL_HASH );
		setShowUserFeedbackForm( true );
	}, [ dispatch ] );

	const onCloseUserFeedbackForm = useCallback( () => {
		// Remove any hash from the URL.
		history.pushState( null, '', window.location.pathname + window.location.search );
		setShowUserFeedbackForm( false );
		setSelectedMenuItem( null ); // Reset selectedMenuItem
	}, [] );

	const isSitesSubmenuLinkSelected = ( link: string, selectedMenuItem: string | null ) => {
		if ( link === defaultSelectedMenuItem && ! selectedMenuItem ) {
			return true;
		} else if ( selectedMenuItem === link ) {
			return true;
		}
		return false;
	};

	return (
		<Sidebar className={ classNames( 'jetpack-cloud-sidebar', className ) }>
			<SidebarHeader forceAllSitesView={ isJetpackManage } />

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
									if ( item.link !== selectedMenuItem ) {
										selectMenuItem( item.link );
									}
									if ( item.trackEventName ) {
										dispatch( recordTracksEvent( item.trackEventName, item.trackEventProps ) );
									}

									item.onClickMenuItem?.( path );
								} }
								{ ...( item.link.startsWith( '/dashboard' ) && {
									isSelected: isSitesSubmenuLinkSelected( item.link, selectedMenuItem ),
								} ) }
							/>
						) ) }
					</SidebarNavigatorMenu>
				</SidebarNavigator>
			</SidebarMain>

			<SidebarFooter className="jetpack-cloud-sidebar__footer">
				<ul>
					{ ! isJetpackManage && jetpackAdminUrl && (
						<SidebarNavigatorMenuItem
							isExternalLink
							title={ translate( 'WP Admin' ) }
							link={ jetpackAdminUrl }
							path={ jetpackAdminUrl }
							icon={ <JetpackIcons icon="wordpress" /> }
							onClickMenuItem={ () => {
								dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_wp_admin_link_click' ) );
							} }
							isSelected={ jetpackAdminUrl === selectedMenuItem }
						/>
					) }
					<SidebarNavigatorMenuItem
						isExternalLink
						title={ translate( 'Get help', {
							comment: 'Jetpack Cloud sidebar navigation item',
						} ) }
						link="https://jetpack.com/support"
						path=""
						icon={ <JetpackIcons icon="help" /> }
						onClickMenuItem={ () => {
							dispatch(
								recordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
									menu_item: 'Jetpack Cloud / Support',
								} )
							);
						} }
						isSelected={ 'https://jetpack.com/support' === selectedMenuItem }
					/>

					{ isAgency && (
						<SidebarNavigatorMenuItem
							title={ translate( 'Share product feedback', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link={ USER_FEEDBACK_FORM_URL_HASH }
							path=""
							icon={ <Icon icon={ starEmpty } /> }
							onClickMenuItem={ onShareProductFeedback }
							isSelected={ USER_FEEDBACK_FORM_URL_HASH === selectedMenuItem }
						/>
					) }
				</ul>
			</SidebarFooter>

			<JetpackCloudSiteSelector />

			<UserFeedbackModalForm show={ showUserFeedbackForm } onClose={ onCloseUserFeedbackForm } />
		</Sidebar>
	);
};

export default JetpackCloudSidebar;
