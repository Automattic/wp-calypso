import { Button, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, moreVertical, comment, backup } from '@wordpress/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ComponentProps } from 'react';
import './style.scss';

export type Options = ComponentProps< typeof DropdownMenu >[ 'controls' ];

interface Props {
	title?: string;
	isChatDocked: boolean;
	onClose: () => void;
	options: Options;
	isHistoryView?: boolean;
}

export default function ChatHeader( {
	title,
	isChatDocked,
	onClose,
	options,
	isHistoryView = false,
}: Props ) {
	const { state } = useLocation();
	const navigate = useNavigate();

	function toggleHistory() {
		if ( ! isHistoryView ) {
			return navigate( '/history' );
		}
		if ( state?.sessionId ) {
			return navigate( '/chat', { state: { sessionId: state.sessionId } } );
		}

		navigate( '/' );
	}

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
				<Button
					className="agents-manager-chat-header__history-toggle-btn"
					icon={ isHistoryView ? comment : backup }
					onClick={ toggleHistory }
					label={
						isHistoryView
							? __( 'Back to chat', '__i18n_text_domain__' )
							: __( 'View history', '__i18n_text_domain__' )
					}
					size={ ! isChatDocked ? 'small' : undefined }
				/>
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
