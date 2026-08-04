import { Button, DropdownMenu } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { close, moreVertical, chevronLeft, Icon } from '@wordpress/icons';
import useHasAiChatEntryButton from '../../hooks/use-has-ai-chat-entry-button';
import { Minimize } from '../icons';
import { AGENTS_MANAGER_STORE } from '../../stores';
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
	const { setIsMinimized } = useDispatch( AGENTS_MANAGER_STORE );
	const hasAiChatEntry = useHasAiChatEntryButton();

	// Minimize only applies to the floating chat reachable from an AI chat entry button
	// (wp-admin bar, Calypso masterbar, or editor toolbar).
	const showMinimize = hasAiChatEntry && ! isDocked;

	return (
		<div className="agents-manager-chat-header">
			{ onBack && (
				<Button
					className="agents-manager-chat-header__back-btn"
					onClick={ onBack }
					aria-label={ __( 'Go Back', __i18n_text_domain__ ) }
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
				{ showMinimize && (
					<Button
						className="agents-manager-chat-header__minimize-btn"
						icon={ <Minimize /> }
						onClick={ () => {
							recordAgentsManagerTracksEvent( 'chat_minimize' );
							setIsMinimized( true );
						} }
						label={ __( 'Minimize', __i18n_text_domain__ ) }
						size="small"
					/>
				) }
				<DropdownMenu
					className="agents-manager-chat-header__more-options"
					controls={ options }
					icon={ moreVertical }
					label={ __( 'More Options', __i18n_text_domain__ ) }
					// Render inside the panel node so opening the menu doesn't blur the panel
					popoverProps={ {
						className: 'agents-manager-chat-header__menu-popover',
						inline: true,
					} }
					toggleProps={ { size: 'small' } }
				/>
				<Button
					className="agents-manager-chat-header__close-btn"
					icon={ close }
					onClick={ onClose }
					label={ __( 'Close', __i18n_text_domain__ ) }
					size="small"
				/>
			</div>
		</div>
	);
}
