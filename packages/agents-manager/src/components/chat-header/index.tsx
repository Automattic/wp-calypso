import { Button, DropdownMenu } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { close, lineSolid, moreVertical, backup, chevronLeft, Icon } from '@wordpress/icons';
import { useNavigate } from 'react-router-dom';
import { hasAiChatEntryButton } from '../../hooks/use-admin-bar-integration';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { isReaderChatHost } from '../../utils/is-reader-chat-agent';
import { recordAgentsManagerTracksEvent } from '../../utils/tracks';
import type { ComponentProps } from 'react';
import './style.scss';

export type Options = ComponentProps< typeof DropdownMenu >[ 'controls' ];

interface Props {
	title?: string;
	onClose: () => void;
	options: Options;
	onBack?: () => void;
	/** Effective docked state (`canDock && isDocked`), not the stored preference. */
	isDocked: boolean;
}

export default function ChatHeader( { onClose, options, title, onBack, isDocked }: Props ) {
	const navigate = useNavigate();
	const { setIsMinimized } = useDispatch( AGENTS_MANAGER_STORE );
	const [ hasAiChatEntry ] = useState( hasAiChatEntryButton );

	// Minimize only applies to the floating chat reachable from the AI chat button
	// (WP admin bar or Calypso masterbar).
	const showMinimize = hasAiChatEntry && ! isDocked;

	return (
		<div className="agents-manager-chat-header">
			{ onBack && (
				<Button
					className="agents-manager-chat-header__back-btn"
					onClick={ onBack }
					aria-label={ __( 'Go Back', '__i18n_text_domain__' ) }
					size="small"
				>
					<Icon icon={ chevronLeft } />
				</Button>
			) }
			{ title && (
				// Show the full title on hover when it's truncated.
				<div className="agents-manager-chat-header__title" title={ title }>
					{ title }
				</div>
			) }
			<div className="agents-manager-chat-header__actions">
				<DropdownMenu
					className="agents-manager-chat-header__more-options"
					controls={ options }
					icon={ moreVertical }
					label={ __( 'More Options', '__i18n_text_domain__' ) }
					// Body-level popovers need a stable anchor for public host style isolation.
					popoverProps={ {
						className: 'agents-manager-chat-header__menu-popover',
					} }
					toggleProps={ { size: 'small' } }
				/>
				{ /*
				 * Reader chat runs on public blog frontends where session history
				 * isn't user-accessible (no account, per-visit local storage).
				 */ }
				{ ! isReaderChatHost() && (
					<Button
						className="agents-manager-chat-header__history-btn"
						icon={ backup }
						onClick={ () => {
							recordAgentsManagerTracksEvent( 'chat_history_open' );
							navigate( '/history' );
						} }
						label={ __( 'View history', '__i18n_text_domain__' ) }
						size="small"
					/>
				) }
				{ showMinimize && (
					<Button
						className="agents-manager-chat-header__minimize-btn"
						icon={ lineSolid }
						onClick={ () => {
							recordAgentsManagerTracksEvent( 'chat_minimize' );
							setIsMinimized( true );
						} }
						label={ __( 'Minimize', '__i18n_text_domain__' ) }
						size="small"
					/>
				) }
				<Button
					className="agents-manager-chat-header__close-btn"
					icon={ close }
					onClick={ onClose }
					label={ __( 'Close', '__i18n_text_domain__' ) }
					size="small"
				/>
			</div>
		</div>
	);
}
