import { CardHeader, Button, Flex } from '@wordpress/components';
import { closeSmall, chevronUp, lineSolid } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useHCWindowCommunicator } from '../happychat-window-communicator';
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

	useEffect( () => {
		if ( chatWindowStatus === 'open' ) {
			onMinimize?.();
		}
	}, [ chatWindowStatus, onMinimize ] );

	useHCWindowCommunicator( setChatWindowStatus, setUnreadCount );

	return (
		<CardHeader className={ classNames }>
			<Flex>
				<p style={ { fontSize: 14, fontWeight: 500 } }>
					{ headerText }
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
							onClick={ onMaximize }
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
