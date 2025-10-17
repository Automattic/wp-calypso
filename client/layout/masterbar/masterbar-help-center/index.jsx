import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { usePrevious } from '@wordpress/compose';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { Icon, comment, backup, page, video, rss } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { parse } from 'qs';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
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

	const { helpCenterVisible, unreadCount } = useDateStoreSelect( ( select ) => ( {
		helpCenterVisible: select( HELP_CENTER_STORE ).isHelpCenterShown(),
		unreadCount: select( HELP_CENTER_STORE ).getUnreadCount(),
	} ) );
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	// Check if the new menu panel feature is enabled (both feature flag AND query param must be true)
	const queryParams = parse( window.location.search.replace( /^\?/, '' ) );
	const isMenuPanelEnabled =
		config.isEnabled( 'help-center-menu-panel' ) &&
		queryParams[ 'help-center-menu-panel' ] === 'true';

	const handleToggleHelpCenter = ( destination = null ) => {
		recordTracksEvent( `calypso_inlinehelp_${ helpCenterVisible ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			destination,
		} );

		if ( destination ) {
			setNavigateToRoute( destination );
		}
		setShowHelpCenter( ! helpCenterVisible );
	};

	const handleExternalLink = ( url ) => {
		return () => {
			window.open( url, '_blank', 'noopener,noreferrer' );
		};
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
				onClick: () => handleToggleHelpCenter( '/odie' ),
			},
			{
				label: (
					<div className="masterbar__help-menu-item">
						<Icon icon={ backup } size={ 24 } />
						<span>{ translate( 'Chat history' ) }</span>
					</div>
				),
				onClick: () => handleToggleHelpCenter( '/chat-history' ),
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
				onClick: () => handleToggleHelpCenter( '/' ),
			},
			{
				label: (
					<div className="masterbar__help-menu-item">
						<Icon icon={ video } size={ 24 } />
						<span>{ translate( 'Courses' ) }</span>
					</div>
				),
				onClick: handleExternalLink( localizeUrl( 'https://wordpress.com/support/courses/' ) ),
			},
			{
				label: (
					<div className="masterbar__help-menu-item">
						<Icon icon={ rss } size={ 24 } />
						<span>{ translate( 'Product updates' ) }</span>
					</div>
				),
				onClick: handleExternalLink(
					localizeUrl( 'https://wordpress.com/blog/category/product-features/' )
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
				onClick={ isMenuPanelEnabled ? undefined : handleToggleHelpCenter }
				className={ clsx( 'masterbar__item-help', {
					'is-active': helpCenterVisible,
					'is-menu-panel': isMenuPanelEnabled,
				} ) }
				wrapperClassName={ clsx( {
					'is-menu-panel': isMenuPanelEnabled,
				} ) }
				tooltip={ tooltip }
				icon={ <HelpCenterIcon hasUnread={ unreadCount > 0 } /> }
				subItems={ isMenuPanelEnabled ? menuItems : undefined }
			/>
		</>
	);
};

export default MasterbarHelpCenter;
