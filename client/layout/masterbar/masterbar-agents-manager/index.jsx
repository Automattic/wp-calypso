import { AGENTS_MANAGER_STORE } from '@automattic/agents-manager';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { usePrevious } from '@wordpress/compose';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { Icon, comment, backup, page, video, rss } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import getIsNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from '../item';
import AgentsManagerIcon from './agents-manager-icon';
import './style.scss';

const MasterbarAgentsManager = ( { tooltip } ) => {
	const translate = useTranslate();
	const sectionName = useSelector( getSectionName );
	const isNotificationsOpen = useSelector( ( state ) => getIsNotificationsOpen( state ) );
	const prevIsNotificationsOpen = usePrevious( isNotificationsOpen );
	const [ agentsManagerPage, setAgentsManagerPage ] = useState( null );

	const { agentsManagerVisible, routerHistory } = useDateStoreSelect( ( select ) => {
		const state = select( AGENTS_MANAGER_STORE ).getAgentsManagerState();
		return {
			agentsManagerVisible: state.isOpen,
			routerHistory: state.routerHistory,
		};
	}, [] );

	const { setIsOpen, setRouterHistory } = useDataStoreDispatch( AGENTS_MANAGER_STORE );

	const trackIconInteraction = () => {
		recordTracksEvent( `wpcom_help_center_icon_interaction`, {
			is_help_center_visible: agentsManagerVisible,
			section: sectionName,
			is_menu_panel_enabled: true,
			is_assignment_loaded: true,
		} );
	};

	// Helper to navigate to a route by updating the router history
	const navigateToRoute = ( pathname, state = null ) => {
		const newLocation = {
			pathname,
			search: '',
			hash: '',
			state,
			key: crypto.randomUUID(),
		};

		const currentEntries = routerHistory?.entries || [
			{ pathname: '/', search: '', hash: '', key: 'default', state: null },
		];
		const currentIndex = routerHistory?.index ?? 0;

		// Add the new location to history
		const newEntries = [ ...currentEntries.slice( 0, currentIndex + 1 ), newLocation ];
		const newIndex = newEntries.length - 1;

		setRouterHistory( { entries: newEntries, index: newIndex } );
	};

	const handleMenuClick = ( destination, isExternal = false ) => {
		recordTracksEvent( `calypso_dashboard_help_center_menu_panel_click`, {
			section: sectionName,
			destination,
		} );

		if ( isExternal ) {
			return window.open( destination, '_blank', 'noopener,noreferrer' );
		}

		// If agents manager is already open and we click the same destination, close it
		if ( agentsManagerVisible && destination === agentsManagerPage ) {
			recordTracksEvent( `calypso_inlinehelp_close`, {
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
			} );
			setIsOpen( false );
			setAgentsManagerPage( null );
		} else {
			// Navigate to the route and open the agents manager
			const routeState = destination === '/chat' ? { isNewChat: true } : null;
			navigateToRoute( destination, routeState );
			setAgentsManagerPage( destination );
			setIsOpen( true );

			recordTracksEvent( `calypso_inlinehelp_show`, {
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
				destination,
			} );
		}
	};

	// Menu items for the panel
	const menuItems = [
		[
			{
				label: (
					<div className="masterbar__agents-manager-menu-item">
						<Icon icon={ comment } size={ 24 } />
						<span>{ translate( 'Chat Support' ) }</span>
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
			setIsOpen( false );
		}
	}, [ agentsManagerVisible, isNotificationsOpen, prevIsNotificationsOpen, setIsOpen ] );

	return (
		<>
			<Item
				onClick={ trackIconInteraction }
				className={ clsx( 'masterbar__item-agents-manager', {
					'is-active': agentsManagerVisible,
					'is-menu-panel': true,
				} ) }
				wrapperClassName="is-menu-panel"
				tooltip={ tooltip }
				icon={ <AgentsManagerIcon hasUnread={ false } /> }
				subItems={ menuItems }
				openSubMenuOnClick
			/>
		</>
	);
};

export default MasterbarAgentsManager;
