import {
	closeAgentsManagerChat,
	getAgentsManagerChatRoute,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	useShouldUseUnifiedAgent,
} from '@automattic/agents-manager';
import { omnibarSiteIdQuery } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports -- Help Center host events need explicit site attribution.
import { withSiteContext } from '@automattic/calypso-analytics';
// eslint-disable-next-line no-restricted-imports -- constants-only module, keeps data-stores out of the main bundle
import { HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT } from '@automattic/data-stores/src/help-center/constants';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Icon, backup, comment, page, rss, video } from '@wordpress/icons';
import { useExperiment } from 'calypso/lib/explat';
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
	omnibarSiteId: number | null | undefined,
	sectionName: string | undefined,
	isExternal = false
) {
	// Re-clicking the current route closes the chat; external links never do.
	const isClosing =
		! isExternal && isAgentsManagerChatVisible() && getAgentsManagerChatRoute() === destination;

	recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
		section: sectionName,
		destination,
		action: isClosing ? 'close' : 'open',
	} );

	if ( isExternal ) {
		window.open( destination, '_blank', 'noopener,noreferrer' );
		return;
	}

	if ( isClosing ) {
		recordTracksEvent(
			'calypso_inlinehelp_close',
			withSiteContext(
				{
					location: 'help-center',
					section: sectionName,
				},
				'omnibar',
				omnibarSiteId
			)
		);
		closeAgentsManagerChat();
		return;
	}

	// `/chat` resumes the active conversation (no path), matching the AI button;
	// other items open the chat at their own route.
	openAgentsManagerChat( destination === '/chat' ? undefined : destination );

	recordTracksEvent(
		'calypso_inlinehelp_show',
		withSiteContext(
			{
				location: 'help-center',
				section: sectionName,
				destination,
			},
			'omnibar',
			omnibarSiteId
		)
	);
}

function getAgentsManagerMenuNodes(
	recordTracksEvent: RecordTracksEvent,
	omnibarSiteId: number | null | undefined,
	sectionName: string | undefined
): OmnibarNode[] {
	return [
		{
			id: 'help-chat',
			group: true,
			children: [
				{
					id: 'chat-support',
					title: __( 'Chat support' ),
					icon: menuIcon( comment ),
					onClick: () => handleMenuClick( recordTracksEvent, '/chat', omnibarSiteId, sectionName ),
				},
				{
					id: 'chat-history',
					title: __( 'Chat history' ),
					icon: menuIcon( backup ),
					onClick: () =>
						handleMenuClick( recordTracksEvent, '/history', omnibarSiteId, sectionName ),
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
					onClick: () =>
						handleMenuClick( recordTracksEvent, '/support-guides', omnibarSiteId, sectionName ),
				},
				{
					id: 'courses',
					title: __( 'Courses' ),
					icon: menuIcon( video ),
					onClick: () =>
						handleMenuClick(
							recordTracksEvent,
							localizeUrl( 'https://wordpress.com/support/courses/' ),
							omnibarSiteId,
							sectionName,
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
							omnibarSiteId,
							sectionName,
							true
						),
				},
			],
		},
	];
}

export function useHelpCenterPlugin( { sectionName }: { sectionName?: string } ): OmnibarNode {
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();
	const { recordTracksEvent } = useAnalytics();
	const { data: omnibarSiteId } = useQuery( omnibarSiteIdQuery() );
	// Load the assignment where the entry point renders, so ExPlat exposure covers
	// everyone who sees it, not only users who open the Help Center.
	useExperiment( HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT );

	if ( shouldUseUnifiedAgent ) {
		return {
			id: 'help-center',
			label: __( 'Help' ),
			icon: <HelpIcon />,
			children: getAgentsManagerMenuNodes( recordTracksEvent, omnibarSiteId, sectionName ),
		};
	}

	return {
		id: 'help-center',
		label: __( 'Help' ),
		icon: <HelpIcon />,
		onClick: () => setShowHelpCenter( ! isHelpCenterShown ),
	};
}
