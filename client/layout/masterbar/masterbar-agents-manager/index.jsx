import {
	AGENTS_MANAGER_STORE,
	closeAgentsManagerChat,
	getAgentsManagerChatRoute,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
} from '@automattic/agents-manager';
import { recordTracksEvent, withSiteContext } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSelect as useDateStoreSelect } from '@wordpress/data';
import { Icon, comment, backup, page, video, rss } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useHelpCenterSite } from 'calypso/layout/use-help-center-site';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from '../item';
import HelpIcon from './help-icon';
import './style.scss';

const MasterbarAgentsManager = ( { tooltip } ) => {
	const translate = useTranslate();
	const sectionName = useSelector( getSectionName );
	const { siteCandidates } = useHelpCenterSite();

	const agentsManagerVisible = useDateStoreSelect(
		( select ) => select( AGENTS_MANAGER_STORE ).getAgentsManagerState().isOpen,
		[]
	);

	const trackIconInteraction = () => {
		recordTracksEvent(
			'wpcom_help_center_icon_interaction',
			withSiteContext(
				{
					is_help_center_visible: agentsManagerVisible,
					section: sectionName,
					is_menu_panel_enabled: true,
					is_assignment_loaded: true,
				},
				siteCandidates
			)
		);
	};

	const handleMenuClick = ( destination, isExternal = false ) => {
		// Re-clicking the current route closes the chat; external links never do.
		const isClosing =
			! isExternal && isAgentsManagerChatVisible() && getAgentsManagerChatRoute() === destination;

		recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
			section: sectionName,
			destination,
			action: isClosing ? 'close' : 'open',
		} );

		if ( isExternal ) {
			return window.open( destination, '_blank', 'noopener,noreferrer' );
		}

		if ( isClosing ) {
			recordTracksEvent(
				'calypso_inlinehelp_close',
				withSiteContext(
					{
						location: 'help-center',
						section: sectionName,
					},
					siteCandidates
				)
			);
			return closeAgentsManagerChat();
		}

		// `/chat` resumes the active conversation (no path), matching the AI
		// button; other items open the chat at their own route.
		openAgentsManagerChat( destination === '/chat' ? undefined : destination );

		recordTracksEvent(
			'calypso_inlinehelp_show',
			withSiteContext(
				{
					location: 'help-center',
					section: sectionName,
					destination,
				},
				siteCandidates
			)
		);
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

	return (
		<Item
			onClick={ trackIconInteraction }
			className="masterbar__item-agents-manager"
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
