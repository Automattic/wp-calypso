/* eslint-disable no-restricted-imports */
import { translationExists } from '@automattic/i18n-utils';
import { calculateUnread } from '@automattic/odie-client/src/data/use-get-unread-conversations';
import {
	Spinner,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useChatStatus, useGetHistoryChats } from '../hooks';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';
import { EmailFallbackNotice } from './notices';
import { getLastMessage } from './utils';
import type {
	Conversations,
	SupportInteraction,
	ZendeskConversation,
} from '@automattic/odie-client';

const EmptyStateArtWork = () => {
	return (
		<svg
			viewBox="0 0 368 184"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
		>
			<rect width="368" height="184" fill="url(#pattern0_789_83980)" fillOpacity="0.12" />
			<path
				d="M215.5 50H152.5C146.725 50 142 54.725 142 60.5V128.225C142 131.375 144.625 134 147.775 134C149.206 134 150.204 133.567 151.555 132.7C151.836 132.52 152.092 132.304 152.323 132.064L164.262 119.665C165.133 118.761 166.334 118.25 167.59 118.25H215.5C221.275 118.25 226 113.525 226 107.75V60.5C226 54.725 221.275 50 215.5 50Z"
				fill="white"
				stroke="url(#paint0_linear_789_83980)"
			/>
			<defs>
				<pattern
					id="pattern0_789_83980"
					patternContentUnits="objectBoundingBox"
					width="0.0163043"
					height="0.0326087"
				>
					<use xlinkHref="#image0_789_83980" transform="scale(0.0013587 0.00271739)" />
				</pattern>
				<linearGradient
					id="paint0_linear_789_83980"
					x1="147.895"
					y1="83.6"
					x2="218.653"
					y2="83.8365"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor="#3858E9" />
					<stop offset="100%" stopColor="#069E08" />
				</linearGradient>
				<image
					id="image0_789_83980"
					width="12"
					height="12"
					preserveAspectRatio="none"
					xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGklEQVR4nGNgGAUo4D82QSYCirFqIsmG4QAAKKwD//0jFGoAAAAASUVORK5CYII="
				/>
			</defs>
		</svg>
	);
};

const Conversations = ( {
	conversations,
	isLoadingInteractions,
}: {
	conversations: Conversations;
	supportInteractions: SupportInteraction[];
	isLoadingInteractions?: boolean;
} ) => {
	const { __ } = useI18n();

	if ( isLoadingInteractions && ! conversations.length ) {
		return (
			<div className="help-center-chat-history__loading">
				<Spinner />
			</div>
		);
	}

	if ( ! conversations.length ) {
		if (
			translationExists( 'Nothing here yet' ) &&
			translationExists( 'Start a new conversation if you need any help.' )
		) {
			return (
				<div className="help-center-chat-history__no-results">
					<VStack spacing={ 6 } alignment="center">
						<EmptyStateArtWork />
						<VStack spacing={ 2 }>
							<Heading align="center" size="body" level={ 3 }>
								{ __( 'Nothing here yet', __i18n_text_domain__ ) }
							</Heading>
							<Text align="center" isBlock variant="muted">
								{ __( 'Start a new conversation if you need any help.', __i18n_text_domain__ ) }
							</Text>
						</VStack>
					</VStack>
				</div>
			);
		}

		return (
			<div className="help-center-chat-history__no-results">
				{ translationExists( "No chats yet, but we're ready when you are." )
					? __( "No chats yet, but we're ready when you are.", __i18n_text_domain__ )
					: __( 'Nothing found…', __i18n_text_domain__ ) }
			</div>
		);
	}

	return (
		<>
			{ conversations.map( ( conversation ) => {
				const { numberOfUnreadMessages } = calculateUnread( [
					conversation as ZendeskConversation,
				] );
				const lastMessage = getLastMessage( { conversation } );

				if ( ! lastMessage ) {
					return null;
				}

				return (
					<HelpCenterSupportChatMessage
						sectionName="chat_history"
						key={ conversation.id }
						message={ lastMessage }
						conversation={ conversation }
						numberOfUnreadMessages={ numberOfUnreadMessages }
					/>
				);
			} ) }
		</>
	);
};

export const HelpCenterChatHistory = () => {
	const { supportInteractions, isLoadingInteractions, recentConversations } = useGetHistoryChats();
	const { forceEmailSupport } = useChatStatus();

	return (
		<>
			{ forceEmailSupport && <EmailFallbackNotice /> }
			<Conversations
				conversations={ recentConversations }
				supportInteractions={ supportInteractions }
				isLoadingInteractions={ isLoadingInteractions }
			/>
		</>
	);
};
