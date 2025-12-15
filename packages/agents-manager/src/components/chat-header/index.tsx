import { Button, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, moreVertical, backup, chevronLeft, Icon } from '@wordpress/icons';
import { useNavigate } from 'react-router-dom';
import type { ComponentProps } from 'react';
import './style.scss';

export type Options = ComponentProps< typeof DropdownMenu >[ 'controls' ];

interface Props {
	title?: string;
	isChatDocked: boolean;
	onClose: () => void;
	options: Options;
	onBack?: () => void;
}

export default function ChatHeader( { isChatDocked, onClose, options, title, onBack }: Props ) {
	const navigate = useNavigate();

	const buttonSize = ! isChatDocked ? 'small' : undefined;

	return (
		<div className="agents-manager-chat-header">
			{ onBack && (
				<Button
					className="agents-manager-chat-header__back-btn"
					onClick={ onBack }
					aria-label={ __( 'Go Back', '__i18n_text_domain__' ) }
				>
					<Icon icon={ chevronLeft } />
				</Button>
			) }
			{ title && <div className="agents-manager-chat-header__title">{ title }</div> }
			<div className="agents-manager-chat-header__actions">
				<DropdownMenu
					className="agents-manager-chat-header__more-options"
					controls={ options }
					icon={ moreVertical }
					label={ __( 'More Options', '__i18n_text_domain__' ) }
					toggleProps={ { size: buttonSize } }
				/>
				<Button
					className="agents-manager-chat-header__history-btn"
					icon={ backup }
					onClick={ () => navigate( '/history' ) }
					label={ __( 'View history', '__i18n_text_domain__' ) }
					size={ buttonSize }
				/>
				<Button
					className="agents-manager-chat-header__close-btn"
					icon={ close }
					onClick={ onClose }
					label={ __( 'Close', '__i18n_text_domain__' ) }
					size={ buttonSize }
				/>
			</div>
		</div>
	);
}
