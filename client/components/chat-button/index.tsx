import { Button, Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useChatStatus } from '@automattic/help-center/src/hooks';
import {
	useCanConnectToZendeskMessaging,
	useZendeskMessagingAvailability,
} from '@automattic/zendesk-client';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import type { MessagingGroup } from '@automattic/zendesk-client';
import type { FC } from 'react';

type ChatIntent = 'SUPPORT' | 'PRESALES' | 'PRECANCELLATION';

type Props = {
	borderless?: boolean;
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

function getMessagingGroupForIntent( chatIntent: ChatIntent ): MessagingGroup {
	switch ( chatIntent ) {
		case 'PRESALES':
			return 'wpcom_presales';

		case 'PRECANCELLATION':
		case 'SUPPORT':
		default:
			return 'wpcom_messaging';
	}
}
const ChatButton: FC< Props > = ( {
	borderless = true,
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
	const { hasActiveChats, isEligibleForChat, isPrecancellationChatOpen, isPresalesChatOpen } =
		useChatStatus();
	const messagingGroup = getMessagingGroupForIntent( chatIntent );
	const { data: isMessagingAvailable } = useZendeskMessagingAvailability(
		messagingGroup,
		isEligibleForChat
	);
	const { setShowHelpCenter, setNavigateToRoute, setNewMessagingChat } =
		useDataStoreDispatch( HELP_CENTER_STORE );
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();

	function shouldShowChatButton(): boolean {
		if ( isEligibleForChat && hasActiveChats ) {
			return true;
		}

		switch ( chatIntent ) {
			case 'PRESALES':
				if ( ! isPresalesChatOpen ) {
					return false;
				}
				break;

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
			setNavigateToRoute( '/contact-options' );
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
			primary={ primary }
			borderless={ borderless }
			onClick={ handleClick }
			title={ __( 'Contact us' ) }
		>
			{ getChildren() }
		</Button>
	);
};

export default ChatButton;
