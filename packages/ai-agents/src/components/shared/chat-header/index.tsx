/**
 * Chat Header Component
 * Header for AI agent with close button and dropdown menu
 */

import { Button, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, moreVertical } from '@wordpress/icons';
import './style.scss';

export interface ChatHeaderMenuItem {
	/**
	 * Unique identifier for the menu item
	 */
	id?: string;
	/**
	 * Icon to display
	 */
	icon: JSX.Element;
	/**
	 * Menu item title/label
	 */
	title: string;
	/**
	 * Click handler
	 */
	onClick: () => void;
}

export interface ChatHeaderProps {
	/**
	 * Whether chat is docked (affects button sizes)
	 */
	isChatDocked?: boolean;
	/**
	 * Close handler
	 */
	onClose: () => void;
	/**
	 * Menu items for dropdown
	 */
	options?: ChatHeaderMenuItem[];
}

/**
 * ChatHeader Component
 *
 * Displays a header with menu dropdown and close button
 */
export default function ChatHeader( {
	isChatDocked = true,
	onClose,
	options = [],
}: ChatHeaderProps ) {
	return (
		<div className="ai-agent-chat-header">
			<div className="ai-agent-chat-header__actions">
				{ options.length > 0 && (
					<DropdownMenu
						className="ai-agent-chat-header__more-options"
						controls={ options }
						icon={ moreVertical }
						label={ __( 'More Options', 'ai-agents' ) }
						toggleProps={ {
							size: ! isChatDocked ? 'small' : undefined,
						} }
					/>
				) }
				<Button
					className="ai-agent-chat-header__close-btn"
					icon={ close }
					onClick={ onClose }
					label={ __( 'Close', 'ai-agents' ) }
					size={ ! isChatDocked ? 'small' : undefined }
				/>
			</div>
		</div>
	);
}
