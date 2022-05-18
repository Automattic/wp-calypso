import { CardHeader, Button, Flex } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { closeSmall, chevronUp, lineSolid } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useHCWindowCommunicator } from '../happychat-window-communicator';
import { STORE_KEY } from '../store';
import type { Header, WindowState } from '../types';

const HelpCenterMobileHeader: React.FC< Header > = ( {
	isMinimized,
	onMinimize,
	onMaximize,
	onDismiss,
	headerText,
} ) => {
	const classNames = classnames( 'help-center__container-header' );
	const { __ } = useI18n();
	const [ chatWindowStatus, setChatWindowStatus ] = useState< WindowState >( 'closed' );
	const [ unreadCount, setUnreadCount ] = useState< number >( 0 );
	const formattedUnreadCount = unreadCount > 9 ? '9+' : unreadCount;
	const popup = useSelect( ( select ) => select( STORE_KEY ).getPopup() );

	useEffect( () => {
		if ( chatWindowStatus === 'open' && popup ) {
			onMinimize?.();
		}
	}, [ chatWindowStatus, onMinimize, popup ] );

	// if the chat is open in a popup, and the user tried to maximize the help-center
	// show them the popup instead
	function requestMaximize() {
		if ( chatWindowStatus !== 'closed' && popup ) {
			popup.focus();
		} else {
			onMaximize?.();
		}
	}

	// kill the help center when the user closes the popup chat window
	useEffect( () => {
		if ( chatWindowStatus === 'ended' ) {
			onDismiss?.();
		}
	}, [ chatWindowStatus, onDismiss ] );

	useHCWindowCommunicator( setChatWindowStatus, setUnreadCount );

	return (
		<CardHeader className={ classNames }>
			<Flex>
				<p className="help-center-header__text">
					<span className="help-center-header__title">{ headerText }</span>
					<span
						className="help-center-header__a8c-only-badge"
						title="The help center is only visible to Automatticians at this stage."
					>
						a8c only
					</span>
					{ isMinimized && unreadCount ? (
						<span className="help-center-header__unread-count">{ formattedUnreadCount }</span>
					) : null }
				</p>
				<div>
					{ isMinimized ? (
						<Button
							className={ 'help-center-header__maximize' }
							label={ __( 'Maximize Help Center', __i18n_text_domain__ ) }
							icon={ chevronUp }
							onClick={ requestMaximize }
						/>
					) : (
						<Button
							className={ 'help-center-header__minimize' }
							label={ __( 'Minimize Help Center', __i18n_text_domain__ ) }
							icon={ lineSolid }
							onClick={ onMinimize }
						/>
					) }

					<Button
						className={ 'help-center-header__close' }
						label={ __( 'Close Help Center', __i18n_text_domain__ ) }
						icon={ closeSmall }
						onClick={ onDismiss }
					/>
				</div>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterMobileHeader;
