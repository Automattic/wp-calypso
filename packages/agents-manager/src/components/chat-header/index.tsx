import { Button, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, moreVertical, backup } from '@wordpress/icons';
import type { ComponentProps } from 'react';
import './style.scss';

export type Options = ComponentProps< typeof DropdownMenu >[ 'controls' ];

interface Props {
	isChatDocked: boolean;
	onClose: () => void;
	options: Options;
	onHistoryToggle?: () => void;
	viewState?: 'chat' | 'history';
	title?: string;
	supportsHistory?: boolean;
}

export default function ChatHeader( {
	isChatDocked,
	onClose,
	options,
	onHistoryToggle,
	viewState,
	title,
	supportsHistory = true,
}: Props ) {
	return (
		<div className="agents-manager-chat-header">
			{ title && <div className="agents-manager-chat-header__title">{ title }</div> }
			<div className="agents-manager-chat-header__actions">
				<DropdownMenu
					className="agents-manager-chat-header__more-options"
					controls={ options }
					icon={ moreVertical }
					label={ __( 'More Options', '__i18n_text_domain__' ) }
					toggleProps={ {
						size: ! isChatDocked ? 'small' : undefined,
					} }
				/>
				{ supportsHistory && onHistoryToggle && (
					<Button
						className="agents-manager-chat-header__history-btn"
						icon={ backup }
						onClick={ onHistoryToggle }
						label={
							viewState === 'history'
								? __( 'Back to chat', '__i18n_text_domain__' )
								: __( 'View history', '__i18n_text_domain__' )
						}
						size={ ! isChatDocked ? 'small' : undefined }
					/>
				) }
				<Button
					className="agents-manager-chat-header__close-btn"
					icon={ close }
					onClick={ onClose }
					label={ __( 'Close', '__i18n_text_domain__' ) }
					size={ ! isChatDocked ? 'small' : undefined }
				/>
			</div>
		</div>
	);
}
