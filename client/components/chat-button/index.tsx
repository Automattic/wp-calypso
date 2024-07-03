import { Button, Gridicon, Spinner } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import {
	useChatStatus,
	useChatWidget,
	useCanConnectToZendesk,
	useMessagingAvailability,
} from '@automattic/help-center/src/hooks';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import type { MessagingGroup } from '@automattic/help-center/src/hooks/use-messaging-availability';
import type { ZendeskConfigName } from '@automattic/help-center/src/hooks/use-zendesk-messaging';
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
	children?: React.ReactNode;
	withHelpCenter?: boolean;
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

function getConfigNameForIntent( chatIntent: ChatIntent ): ZendeskConfigName {
	switch ( chatIntent ) {
		case 'PRESALES':
			return 'zendesk_presales_chat_key';

		case 'PRECANCELLATION':
		case 'SUPPORT':
		default:
			return 'zendesk_support_chat_key';
	}
}

const ChatButton: FC< Props > = ( {
	borderless = true,
	chatIntent = 'SUPPORT',
	children,
	className = '',
	initialMessage,
	onClick,
	onError,
	primary = false,
	siteUrl,
	withHelpCenter = true,
} ) => {
	const { __ } = useI18n();
	const { hasActiveChats, isEligibleForChat, isPrecancellationChatOpen, isPresalesChatOpen } =
		useChatStatus();
	const messagingGroup = getMessagingGroupForIntent( chatIntent );
	const { data: isMessagingAvailable } = useMessagingAvailability(
		messagingGroup,
		isEligibleForChat
	);
	const { setShowHelpCenter, setInitialRoute } = useDataStoreDispatch( HELP_CENTER_STORE );
	const { data: canConnectToZendesk } = useCanConnectToZendesk();

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

	const configName = getConfigNameForIntent( chatIntent );
	const { isOpeningChatWidget, openChatWidget } = useChatWidget(
		configName,
		shouldShowChatButton()
	);

	const handleClick = () => {
		if ( canConnectToZendesk ) {
			openChatWidget( {
				message: initialMessage,
				siteUrl,
				onError,
				onSuccess: onClick,
			} );
		} else {
			setInitialRoute( '/contact-form?mode=CHAT' );
			setShowHelpCenter( true );
			onClick?.();
		}
	};

	const classes = clsx( 'chat-button', className );

	if ( ! shouldShowChatButton() ) {
		return null;
	}

	function getChildren() {
		if ( isOpeningChatWidget ) {
			return <Spinner />;
		}

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
