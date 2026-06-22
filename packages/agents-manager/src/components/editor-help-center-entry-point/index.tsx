import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button, Fill, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup, comment, help, page, rss, video } from '@wordpress/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	AI_CHAT_ENTRY_BUTTON_ID,
	EDITOR_HELP_ENTRY_BUTTON_ID,
} from '../../hooks/use-admin-bar-integration';
import { AI } from '../icons';
import type { ComponentProps } from 'react';

type DropdownControls = ComponentProps< typeof DropdownMenu >[ 'controls' ];

interface Props {
	/** Whether the current chat route is expanded and visible. */
	isChatVisible: boolean;
	/** Opens or expands the chat without changing the current route. */
	onOpen: () => void;
	/** Closes the chat panel. */
	onClose: () => void;
	/** Resumes the active chat session and routes to `/chat`. */
	onResumeChat: () => void;
	/** Current section name for Tracks events. */
	sectionName?: string;
}

export default function EditorHelpCenterEntryPoint( {
	isChatVisible,
	onOpen,
	onClose,
	onResumeChat,
	sectionName,
}: Props ) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const eventSection = sectionName || 'gutenberg-editor';

	const handleAiChatClick = () => {
		recordTracksEvent( 'calypso_admin_bar_agents_manager_ai_chat_clicked', {
			section: eventSection,
			action: isChatVisible ? 'close' : 'open',
		} );

		if ( isChatVisible ) {
			onClose();
			return;
		}

		onResumeChat();
		onOpen();
	};

	const trackIconInteraction = () => {
		recordTracksEvent( 'wpcom_help_center_icon_interaction', {
			is_help_center_visible: isChatVisible,
			section: eventSection,
			is_menu_panel_enabled: true,
			is_assignment_loaded: true,
		} );
	};

	const handleRouteClick = ( route: string, destination: string, onRoute?: () => void ) => {
		const isClosing = isChatVisible && pathname === route;
		recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
			section: eventSection,
			destination,
			action: isClosing ? 'close' : 'open',
		} );

		if ( isClosing ) {
			recordTracksEvent( 'calypso_inlinehelp_close', {
				force_site_id: true,
				location: 'help-center',
				section: eventSection,
			} );
			onClose();
			return;
		}

		onRoute?.();
		onOpen();
		recordTracksEvent( 'calypso_inlinehelp_show', {
			force_site_id: true,
			location: 'help-center',
			section: eventSection,
			destination,
		} );
	};

	const handleExternalClick = ( destination: string ) => {
		recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
			section: eventSection,
			destination,
			action: 'open',
		} );
		window.open( destination, '_blank', 'noopener,noreferrer' );
	};

	const menuControls: DropdownControls = [
		[
			{
				title: __( 'Chat support', '__i18n_text_domain__' ),
				icon: comment,
				onClick: () => handleRouteClick( '/chat', 'agents-manager-chat', onResumeChat ),
			},
			{
				title: __( 'Chat history', '__i18n_text_domain__' ),
				icon: backup,
				onClick: () =>
					handleRouteClick( '/history', 'agents-manager-history', () => navigate( '/history' ) ),
			},
		],
		[
			{
				title: __( 'Support guides', '__i18n_text_domain__' ),
				icon: page,
				onClick: () =>
					handleRouteClick( '/support-guides', 'agents-manager-support-guides', () =>
						navigate( '/support-guides' )
					),
			},
			{
				title: __( 'Courses', '__i18n_text_domain__' ),
				icon: video,
				onClick: () =>
					handleExternalClick( localizeUrl( 'https://wordpress.com/support/courses/' ) ),
			},
			{
				title: __( 'Product updates', '__i18n_text_domain__' ),
				icon: rss,
				onClick: () =>
					handleExternalClick(
						localizeUrl( 'https://wordpress.com/blog/category/product-features/' )
					),
			},
		],
	];

	return (
		<Fill name="PinnedItems/core">
			<DropdownMenu
				className="agents-manager-editor-help-center"
				controls={ menuControls }
				icon={ help }
				label={ __( 'Help', '__i18n_text_domain__' ) }
				onToggle={ trackIconInteraction }
				popoverProps={ { position: 'bottom left' } }
				toggleProps={ {
					id: EDITOR_HELP_ENTRY_BUTTON_ID,
					size: 'compact',
				} }
			/>
			<Button
				className="agents-manager-editor-ai-chat"
				data-agents-manager-react-handler="true"
				id={ AI_CHAT_ENTRY_BUTTON_ID }
				icon={ <AI /> }
				label={ __( 'Ask AI', '__i18n_text_domain__' ) }
				onClick={ handleAiChatClick }
				size="compact"
			/>
		</Fill>
	);
}
