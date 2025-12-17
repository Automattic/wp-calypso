import config from '@automattic/calypso-config';
import { Button, Dropdown, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, moreVertical, backup, chevronLeft, Icon, comment } from '@wordpress/icons';
import { useLocation, useNavigate } from 'react-router-dom';
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

const A11nChatMenu = ( { onCloseDropdown }: { onCloseDropdown: () => void } ) => {
	const navigate = useNavigate();
	const { state, pathname, search } = useLocation();
	const isProd = config( 'env_id' ) === 'production';
	const isNewBuilderChat = pathname === '/chat' && ! state?.sessionId;
	const isNewOdieChat = pathname === '/odie' && search === '';

	if ( isProd ) {
		return null;
	}

	return (
		<Dropdown
			popoverProps={ {
				placement: 'right-start',
				offset: 0,
				onFocusOutside: ( { relatedTarget }: { relatedTarget: HTMLElement | null } ) => {
					if ( ! relatedTarget || relatedTarget.role !== 'menuitem' ) {
						onCloseDropdown();
					}
				},
			} }
			renderToggle={ ( { onToggle } ) => (
				<MenuItem icon={ comment } iconPosition="left" onClick={ onToggle }>
					{ __( 'New chat (a8c)', '__i18n_text_domain__' ) }
				</MenuItem>
			) }
			renderContent={ ( { onClose: onCloseSubmenu } ) => (
				<MenuGroup>
					<MenuItem
						disabled={ isNewBuilderChat }
						onClick={ () => {
							navigate( '/chat', { state: { isNewChat: true } } );
							onCloseSubmenu();
							onCloseDropdown();
						} }
					>
						{ __( 'Builder chat', '__i18n_text_domain__' ) }
					</MenuItem>
					<MenuItem
						disabled={ isNewOdieChat }
						onClick={ () => {
							navigate( '/odie' );
							onCloseSubmenu();
							onCloseDropdown();
						} }
					>
						{ __( 'Odie chat', '__i18n_text_domain__' ) }
					</MenuItem>
				</MenuGroup>
			) }
		/>
	);
};

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
				>
					{ ( { onClose } ) => <A11nChatMenu onCloseDropdown={ onClose } /> }
				</DropdownMenu>
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
