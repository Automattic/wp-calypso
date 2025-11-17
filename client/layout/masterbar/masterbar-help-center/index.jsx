import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { usePrevious } from '@wordpress/compose';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { useState } from '@wordpress/element';
import { Icon, comment, backup, page, video, rss } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useExperiment } from 'calypso/lib/explat';
import getIsNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from '../item';
import HelpCenterIcon from './help-center-icon';
import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

const MasterbarHelpCenter = ( { tooltip } ) => {
	const translate = useTranslate();
	const sectionName = useSelector( getSectionName );
	const isNotificationsOpen = useSelector( ( state ) => getIsNotificationsOpen( state ) );
	const prevIsNotificationsOpen = usePrevious( isNotificationsOpen );
	const [ helpCenterPage, setHelpCenterPage ] = useState( null );

	const { helpCenterVisible, unreadCount } = useDateStoreSelect(
		( select ) => ( {
			helpCenterVisible: select( HELP_CENTER_STORE ).isHelpCenterShown(),
			unreadCount: select( HELP_CENTER_STORE ).getUnreadCount(),
		} ),
		[]
	);
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_help_center_menu_popover'
	);
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	// Check if the new menu panel feature is enabled (both feature flag AND query param must be true)
	const isMenuPanelExperimentEnabled =
		! isLoadingExperimentAssignment && experimentAssignment?.variationName === 'menu_popover';

	const trackIconInteraction = () => {
		recordTracksEvent( `wpcom_help_center_icon_interaction`, {
			is_help_center_visible: helpCenterVisible,
			section: sectionName,
			is_menu_panel_enabled: isMenuPanelExperimentEnabled,
		} );
	};

	const handleToggleHelpCenter = () => {
		trackIconInteraction();

		recordTracksEvent( `calypso_inlinehelp_${ helpCenterVisible ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );

		setShowHelpCenter( ! helpCenterVisible );
	};

	const handleMenuClick = ( destination, isExternal = false ) => {
		recordTracksEvent( `calypso_dashboard_help_center_menu_panel_click`, {
			section: sectionName,
			destination,
		} );

		if ( isExternal ) {
			return window.open( destination, '_blank', 'noopener,noreferrer' );
		}

		if ( helpCenterVisible ) {
			if ( destination !== helpCenterPage ) {
				setNavigateToRoute( destination );
				setHelpCenterPage( destination );
			} else {
				recordTracksEvent( `calypso_inlinehelp_close`, {
					force_site_id: true,
					location: 'help-center',
					section: sectionName,
				} );
				setShowHelpCenter( false );
				setHelpCenterPage( null );
			}
		} else {
			setNavigateToRoute( destination );
			setHelpCenterPage( destination );
			setShowHelpCenter( true );

			recordTracksEvent( `calypso_inlinehelp_show`, {
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
				destination,
			} );
		}
	};

	// Menu items for the new panel
	const menuItems = [
		[
			{
				label: (
					<div className="masterbar__help-menu-item">
						<Icon icon={ comment } size={ 24 } />
						<span>{ translate( 'Chat support' ) }</span>
					</div>
				),
				onClick: () => handleMenuClick( '/odie' ),
			},
			{
				label: (
					<div className="masterbar__help-menu-item">
						<Icon icon={ backup } size={ 24 } />
						<span>{ translate( 'Chat history' ) }</span>
					</div>
				),
				onClick: () => handleMenuClick( '/chat-history' ),
			},
		],
		[
			{
				label: <hr />,
				className: 'masterbar__help-menu-divider',
			},
		],
		[
			{
				label: (
					<div className="masterbar__help-menu-item">
						<Icon icon={ page } size={ 24 } />
						<span>{ translate( 'Support guides' ) }</span>
					</div>
				),
				onClick: () => handleMenuClick( '/support-guides' ),
			},
			{
				label: (
					<div className="masterbar__help-menu-item">
						<Icon icon={ video } size={ 24 } />
						<span>{ translate( 'Courses' ) }</span>
					</div>
				),
				onClick: () =>
					handleMenuClick( localizeUrl( 'https://wordpress.com/support/courses/' ), true ),
			},
			{
				label: (
					<div className="masterbar__help-menu-item">
						<Icon icon={ rss } size={ 24 } />
						<span>{ translate( 'Product updates' ) }</span>
					</div>
				),
				onClick: () =>
					handleMenuClick(
						localizeUrl( 'https://wordpress.com/blog/category/product-features/' ),
						true
					),
			},
		],
	];

	// Close the help center when notifications are opened
	useEffect( () => {
		if ( ! prevIsNotificationsOpen && isNotificationsOpen && helpCenterVisible ) {
			setShowHelpCenter( false );
		}
	}, [ helpCenterVisible, isNotificationsOpen, prevIsNotificationsOpen, setShowHelpCenter ] );

	return (
		<>
			<Item
				onClick={ isMenuPanelExperimentEnabled ? trackIconInteraction : handleToggleHelpCenter }
				className={ clsx( 'masterbar__item-help', {
					'is-active': helpCenterVisible,
					'is-menu-panel': isMenuPanelExperimentEnabled,
				} ) }
				wrapperClassName={ clsx( {
					'is-menu-panel': isMenuPanelExperimentEnabled,
				} ) }
				tooltip={ tooltip }
				icon={ <HelpCenterIcon hasUnread={ unreadCount > 0 } /> }
				subItems={ isMenuPanelExperimentEnabled ? menuItems : undefined }
				openSubMenuOnClick={ isMenuPanelExperimentEnabled }
			/>
		</>
	);
};

export default MasterbarHelpCenter;
