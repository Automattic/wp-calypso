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
	/**
	 * Whether the menu item is disabled
	 */
	isDisabled?: boolean;
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
		<div className="agents-manager-chat-header">
			<div className="agents-manager-chat-header__actions">
				{ options.length > 0 && (
					<DropdownMenu
						className="agents-manager-chat-header__more-options"
						controls={ options }
						icon={ moreVertical }
						label={ __( 'More Options', 'agents-manager' ) }
						toggleProps={ {
							size: ! isChatDocked ? 'small' : undefined,
						} }
					/>
				) }
				<Button
					className="agents-manager-chat-header__close-btn"
					icon={ close }
					onClick={ onClose }
					label={ __( 'Close', 'agents-manager' ) }
					size={ ! isChatDocked ? 'small' : undefined }
				/>
			</div>
		</div>
	);
}
