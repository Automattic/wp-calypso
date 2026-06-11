import { AGENTS_MANAGER_STORE } from '@automattic/agents-manager';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { usePrevious } from '@wordpress/compose';
import { useSelect as useDateStoreSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { Icon, comment, backup, page, video, rss } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getIsNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from '../item';
import { closeAgentsManagerChat, openAgentsManagerChat } from './chat-actions';
import HelpIcon from './help-icon';
import './style.scss';

const MasterbarAgentsManager = ( { tooltip } ) => {
	const translate = useTranslate();
	const sectionName = useSelector( getSectionName );
	const isNotificationsOpen = useSelector( ( state ) => getIsNotificationsOpen( state ) );
	const prevIsNotificationsOpen = usePrevious( isNotificationsOpen );

	const agentsManagerVisible = useDateStoreSelect(
		( select ) => select( AGENTS_MANAGER_STORE ).getAgentsManagerState().isOpen,
		[]
	);

	const trackIconInteraction = () => {
		recordTracksEvent( 'wpcom_help_center_icon_interaction', {
			is_help_center_visible: agentsManagerVisible,
			section: sectionName,
			is_menu_panel_enabled: true,
			is_assignment_loaded: true,
		} );
	};

	const handleMenuClick = ( destination, isExternal = false ) => {
		recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
			section: sectionName,
			destination,
		} );

		if ( isExternal ) {
			return window.open( destination, '_blank', 'noopener,noreferrer' );
		}

		// `/chat` resumes the active conversation (no path), matching the AI
		// button; other items open the chat at their own route.
		openAgentsManagerChat( destination === '/chat' ? undefined : destination );

		recordTracksEvent( 'calypso_inlinehelp_show', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			destination,
		} );
	};

	// Menu items for the panel
	const menuItems = [
		[
			{
				label: (
					<div className="masterbar__agents-manager-menu-item">
						<Icon icon={ comment } size={ 24 } />
						<span>{ translate( 'Chat support' ) }</span>
					</div>
				),
				onClick: () => handleMenuClick( '/chat' ),
			},
			{
				label: (
					<div className="masterbar__agents-manager-menu-item">
						<Icon icon={ backup } size={ 24 } />
						<span>{ translate( 'Chat history' ) }</span>
					</div>
				),
				onClick: () => handleMenuClick( '/history' ),
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
					<div className="masterbar__agents-manager-menu-item">
						<Icon icon={ page } size={ 24 } />
						<span>{ translate( 'Support guides' ) }</span>
					</div>
				),
				onClick: () => handleMenuClick( '/support-guides' ),
			},
			{
				label: (
					<div className="masterbar__agents-manager-menu-item">
						<Icon icon={ video } size={ 24 } />
						<span>{ translate( 'Courses' ) }</span>
					</div>
				),
				onClick: () =>
					handleMenuClick( localizeUrl( 'https://wordpress.com/support/courses/' ), true ),
			},
			{
				label: (
					<div className="masterbar__agents-manager-menu-item">
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

	// Close the agents manager when notifications are opened
	useEffect( () => {
		if ( ! prevIsNotificationsOpen && isNotificationsOpen && agentsManagerVisible ) {
			closeAgentsManagerChat();
		}
	}, [ agentsManagerVisible, isNotificationsOpen, prevIsNotificationsOpen ] );

	return (
		<Item
			onClick={ trackIconInteraction }
			className={ clsx( 'masterbar__item-agents-manager', {
				'is-active': agentsManagerVisible,
				'is-menu-panel': true,
			} ) }
			wrapperClassName="is-menu-panel"
			tooltip={ tooltip }
			icon={ <HelpIcon /> }
			subItems={ menuItems }
			openSubMenuOnClick
			closeSubMenuOnItemClick
		/>
	);
};

export default MasterbarAgentsManager;
