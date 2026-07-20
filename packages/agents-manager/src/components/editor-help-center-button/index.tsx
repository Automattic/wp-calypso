import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { DropdownMenu, Fill } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { backup, comment, help, page, rss, video } from '@wordpress/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { isEditorHelpMenuEnabled } from '../../utils/editor-entry-points';
import type { AgentsManagerSelect } from '@automattic/data-stores';

interface Props {
	/** Closes/hides the chat — owned by `AgentDock`. */
	onClose: () => void;
	/** Opens/un-minimizes the chat — owned by `AgentDock`'s layout manager. */
	onOpenChat: () => void;
}

/**
 * Help Center "?" dropdown for the block editor header, shown to the left of the Ask AI button.
 * Replaces the legacy Help Center button in the unified experience (which dequeues it). Items
 * and behavior mirror the `/wp-admin` admin-bar Help menu. The `PinnedItems/core` fill is inert
 * outside the editor.
 */
export default function EditorHelpCenterButton( { onClose, onOpenChat }: Props ) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { resumeActiveChat, sectionName } = useAgentsManagerContext();
	const { isOpen, isMinimized } = useSelect(
		( select ) => ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getAgentsManagerState(),
		[]
	);

	if ( ! isEditorHelpMenuEnabled() ) {
		return null;
	}

	const isChatVisible = isOpen && ! isMinimized;

	// Chat items mirror the admin-bar Help menu: re-clicking the item for the route already
	// showing closes the chat; otherwise navigate there and open it.
	const selectChatRoute = ( destination: string, route: string, onSelect: () => void ) => {
		const isClosing = isChatVisible && pathname === route;

		recordTracksEvent( 'calypso_editor_agents_manager_help_menu_clicked', {
			section: sectionName || 'gutenberg',
			destination,
			action: isClosing ? 'close' : 'open',
		} );

		if ( isClosing ) {
			onClose();
			return;
		}

		onSelect();
		onOpenChat();
	};

	const openExternalLink = ( url: string ) => window.open( url, '_blank', 'noopener,noreferrer' );

	// Grouped like the admin-bar Help menu: a chat group, then a resources group, split by a
	// divider. Chat support, Chat history, and Support guides open the chat; Courses and Product
	// updates open external pages (untracked, matching the admin bar's plain links).
	const controls = [
		[
			{
				title: __( 'Chat support', __i18n_text_domain__ ),
				icon: comment,
				onClick: () => selectChatRoute( 'agents-manager-chat', '/chat', resumeActiveChat ),
			},
			{
				title: __( 'Chat history', __i18n_text_domain__ ),
				icon: backup,
				onClick: () =>
					selectChatRoute( 'agents-manager-history', '/history', () => navigate( '/history' ) ),
			},
		],
		[
			{
				title: __( 'Support guides', __i18n_text_domain__ ),
				icon: page,
				onClick: () =>
					selectChatRoute( 'agents-manager-support-guides', '/support-guides', () =>
						navigate( '/support-guides' )
					),
			},
			{
				title: __( 'Courses', __i18n_text_domain__ ),
				icon: video,
				onClick: () => openExternalLink( localizeUrl( 'https://wordpress.com/support/courses/' ) ),
			},
			{
				title: __( 'Product updates', __i18n_text_domain__ ),
				icon: rss,
				onClick: () =>
					openExternalLink(
						localizeUrl( 'https://wordpress.com/blog/category/product-features/' )
					),
			},
		],
	];

	return (
		<Fill name="PinnedItems/core">
			<DropdownMenu
				className="entry-point-button agents-manager-help-center"
				icon={ help }
				label={ __( 'Help Center', __i18n_text_domain__ ) }
				controls={ controls }
				popoverProps={ { position: 'bottom left' } }
				// Match the Ask AI button (and editor-header convention) so the icon/button size lines up.
				toggleProps={ { size: 'compact' } }
			/>
		</Fill>
	);
}
