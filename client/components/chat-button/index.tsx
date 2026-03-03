import { Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useChatStatus } from '@automattic/help-center/src/hooks';
import {
	useCanConnectToZendeskMessaging,
	useZendeskMessagingAvailability,
} from '@automattic/zendesk-client';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import type { FC } from 'react';

type ChatIntent = 'SUPPORT' | 'PRECANCELLATION';

type Props = {
	chatIntent?: ChatIntent;
	className?: string;
	initialMessage: string;
	onClick?: () => void;
	onError?: () => void;
	primary?: boolean;
	siteUrl?: string;
	siteId?: string | number;
	children?: React.ReactNode;
	withHelpCenter?: boolean;
	section?: string;
};

const HELP_CENTER_STORE = HelpCenter.register();

const ChatButton: FC< Props > = ( {
	chatIntent = 'SUPPORT',
	children,
	className = '',
	initialMessage,
	onClick,
	siteId = null,
	primary = false,
	siteUrl,
	withHelpCenter = true,
	section = '',
} ) => {
	const { __ } = useI18n();
	const { hasActiveChats, isEligibleForChat, isPrecancellationChatOpen } = useChatStatus();
	const { data: isMessagingAvailable } = useZendeskMessagingAvailability(
		'wpcom_messaging',
		isEligibleForChat
	);
	const { setShowHelpCenter, setNavigateToRoute, setNewMessagingChat } =
		useDataStoreDispatch( HELP_CENTER_STORE );
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();

	function shouldShowChatButton(): boolean {
		if ( isEligibleForChat && hasActiveChats && canConnectToZendesk ) {
			return true;
		}

		switch ( chatIntent ) {
			case 'PRECANCELLATION':
				if ( ! isPrecancellationChatOpen ) {
					return false;
				}
				break;
			default:
				break;
		}

		if ( isEligibleForChat && isMessagingAvailable && ( canConnectToZendesk || withHelpCenter ) ) {
			return true;
		}

		return false;
	}

	const handleClick = () => {
		if ( canConnectToZendesk && initialMessage ) {
			onClick?.();
			setNewMessagingChat( { initialMessage, section, siteUrl, siteId } );
		} else {
			setNavigateToRoute( '/odie' );
			setShowHelpCenter( true );
			onClick?.();
		}
	};

	const classes = clsx( 'chat-button', className );

	if ( ! shouldShowChatButton() ) {
		return null;
	}

	function getChildren() {
		return children || <Gridicon icon="chat" />;
	}

	return (
		<Button
			className={ classes }
			variant={ primary ? 'primary' : 'link' }
			onClick={ handleClick }
			title={ __( 'Contact us' ) }
			size="compact"
		>
			{ getChildren() }
		</Button>
	);
};

export default ChatButton;
