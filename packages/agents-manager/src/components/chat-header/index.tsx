import { Button, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, moreVertical } from '@wordpress/icons';
import type { ComponentProps } from 'react';
import './style.scss';

export type Options = ComponentProps< typeof DropdownMenu >[ 'controls' ];

interface Props {
	isChatDocked: boolean;
	onClose: () => void;
	options: Options;
}

export default function ChatHeader( { isChatDocked, onClose, options }: Props ) {
	return (
		<div className="agents-manager-chat-header">
			<div className="agents-manager-chat-header__actions">
				<DropdownMenu
					className="agents-manager-chat-header__more-options"
					controls={ options }
					icon={ moreVertical }
					label={ __( 'More Options', 'agents-manager' ) }
					toggleProps={ {
						size: ! isChatDocked ? 'small' : undefined,
					} }
				/>
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
