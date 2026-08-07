import {
	closeAgentsManagerChat,
	getAgentsManagerChatRoute,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	useShouldUseUnifiedAgent,
} from '@automattic/agents-manager';
import { localizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { Icon, backup, comment, page, rss, video } from '@wordpress/icons';
import { useAnalytics } from '../analytics';
import { useHelpCenter } from '../help-center';
import type { AnalyticsClient } from '../analytics';
import type { OmnibarNode } from '@automattic/omnibar';

import './plugin-help-center.scss';

type RecordTracksEvent = AnalyticsClient[ 'recordTracksEvent' ];

function HelpIcon() {
	return (
		<svg
			className="omnibar__help-icon"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 16v-2h2v2h-2zm2-3v-1.141A3.991 3.991 0 0016 10a4 4 0 00-8 0h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2a1 1 0 00-1 1v2h2z"
			/>
		</svg>
	);
}

function menuIcon( icon: JSX.Element ) {
	return (
		<span className="omnibar__help-menu-icon">
			<Icon icon={ icon } />
		</span>
	);
}

function handleMenuClick(
	recordTracksEvent: RecordTracksEvent,
	destination: string,
	isExternal = false
) {
	// Re-clicking the current route closes the chat; external links never do.
	const isClosing =
		! isExternal && isAgentsManagerChatVisible() && getAgentsManagerChatRoute() === destination;

	recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
		section: 'dashboard',
		destination,
		action: isClosing ? 'close' : 'open',
	} );

	if ( isExternal ) {
		window.open( destination, '_blank', 'noopener,noreferrer' );
		return;
	}

	if ( isClosing ) {
		recordTracksEvent( 'calypso_inlinehelp_close', {
			force_site_id: true,
			location: 'help-center',
			section: 'dashboard',
		} );
		closeAgentsManagerChat();
		return;
	}

	// `/chat` resumes the active conversation (no path), matching the AI button;
	// other items open the chat at their own route.
	openAgentsManagerChat( destination === '/chat' ? undefined : destination );

	recordTracksEvent( 'calypso_inlinehelp_show', {
		force_site_id: true,
		location: 'help-center',
		section: 'dashboard',
		destination,
	} );
}

function getAgentsManagerMenuNodes( recordTracksEvent: RecordTracksEvent ): OmnibarNode[] {
	return [
		{
			id: 'help-chat',
			group: true,
			children: [
				{
					id: 'chat-support',
					title: __( 'Chat support' ),
					icon: menuIcon( comment ),
					onClick: () => handleMenuClick( recordTracksEvent, '/chat' ),
				},
				{
					id: 'chat-history',
					title: __( 'Chat history' ),
					icon: menuIcon( backup ),
					onClick: () => handleMenuClick( recordTracksEvent, '/history' ),
				},
			],
		},
		{
			id: 'help-resources',
			group: true,
			variant: 'secondary',
			children: [
				{
					id: 'support-guides',
					title: __( 'Support guides' ),
					icon: menuIcon( page ),
					onClick: () => handleMenuClick( recordTracksEvent, '/support-guides' ),
				},
				{
					id: 'courses',
					title: __( 'Courses' ),
					icon: menuIcon( video ),
					onClick: () =>
						handleMenuClick(
							recordTracksEvent,
							localizeUrl( 'https://wordpress.com/support/courses/' ),
							true
						),
				},
				{
					id: 'product-updates',
					title: __( 'Product updates' ),
					icon: menuIcon( rss ),
					onClick: () =>
						handleMenuClick(
							recordTracksEvent,
							localizeUrl( 'https://wordpress.com/blog/category/product-features/' ),
							true
						),
				},
			],
		},
	];
}

export function useHelpCenterPlugin(): OmnibarNode {
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();
	const { recordTracksEvent } = useAnalytics();

	if ( shouldUseUnifiedAgent ) {
		return {
			id: 'help-center',
			label: __( 'Help' ),
			icon: <HelpIcon />,
			children: getAgentsManagerMenuNodes( recordTracksEvent ),
		};
	}

	return {
		id: 'help-center',
		label: __( 'Help' ),
		icon: <HelpIcon />,
		onClick: () => setShowHelpCenter( ! isHelpCenterShown ),
	};
}
