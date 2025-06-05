import { Icon, starEmpty } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import JetpackIcons from 'calypso/components/jetpack/jetpack-icons';
import Sidebar, {
	SidebarV2Main as SidebarMain,
	SidebarV2Footer as SidebarFooter,
	SidebarNavigator,
	SidebarNavigatorMenu,
	SidebarNavigatorMenuItem,
} from 'calypso/layout/sidebar-v2';
import { useDispatch, useSelector } from 'calypso/state';
import { loadTrackingTool, recordTracksEvent } from 'calypso/state/analytics/actions';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
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
}: Props ) => {
	const isAgency = useSelector( isAgencyUser );
	const siteId = useSelector( getSelectedSiteId );
	const jetpackAdminUrl = useSelector( ( state ) =>
		siteId ? getSiteAdminUrl( state, siteId ) : null
	);

	const translate = useTranslate();
	const dispatch = useDispatch();

	// Determine whether to initially show the user feedback form.
	const shouldShowUserFeedbackForm = window.location.hash === USER_FEEDBACK_FORM_URL_HASH;

	const [ showUserFeedbackForm, setShowUserFeedbackForm ] = useState( shouldShowUserFeedbackForm );

	const onShareProductFeedback = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_share_product_feedback_click' ) );
		setShowUserFeedbackForm( true );
	}, [ dispatch ] );

	const onCloseUserFeedbackForm = useCallback( () => {
		// Remove any hash from the URL.
		history.pushState( null, '', window.location.pathname + window.location.search );
		setShowUserFeedbackForm( false );
	}, [] );

	useEffect( () => {
		dispatch( loadTrackingTool( 'LogRocket' ) );
	}, [ dispatch ] );

	return (
		<Sidebar className={ clsx( 'jetpack-cloud-sidebar', className ) }>
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

			<SidebarFooter className="jetpack-cloud-sidebar__footer">
				<ul>
					{ ! isJetpackManage && jetpackAdminUrl && (
						<SidebarNavigatorMenuItem
							isExternalLink
							openInSameTab
							title={ translate( 'WP Admin' ) }
							link={ jetpackAdminUrl }
							path={ jetpackAdminUrl }
							icon={ <JetpackIcons icon="wordpress" /> }
							onClickMenuItem={ () => {
								dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_wp_admin_link_click' ) );
							} }
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
