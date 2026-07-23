import { type MarkdownComponents, type MarkdownExtensions } from '@automattic/agenttic-ui';
import {
	useManagedZendeskChat,
	ZENDESK_CUSTOM_FIELD_PRODUCT,
	ZENDESK_CUSTOM_FIELD_WEBSITE_URL,
	ZENDESK_SOURCE_URL_TICKET_FIELD_ID,
} from '@automattic/zendesk-client';
import { useMemo } from '@wordpress/element';
import { useAgentsManagerContext } from '../../contexts';
import AgentChat from '../agent-chat';
import { type Options as ChatHeaderOptions } from '../chat-header';
import ConcludedConversationFooter from '../concluded-conversation-footer';
import type { Message } from '@automattic/agenttic-ui/dist/types';
import './style.scss';

interface Props {
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
	/** Custom components for rendering markdown. */
	markdownComponents?: MarkdownComponents;
	/** Custom markdown extensions. */
	markdownExtensions?: MarkdownExtensions;
}

function withHttpsProtocol( domain: string ) {
	return /^https?:\/\//.test( domain ) ? domain : `https://${ domain }`;
}

function getSiteUrl( site: ReturnType< typeof useAgentsManagerContext >[ 'site' ] ) {
	if ( site?.URL ) {
		return site.URL;
	}

	if ( site?.domain ) {
		return withHttpsProtocol( site.domain );
	}

	return window.location.href;
}

export default function ZendeskChat( {
	chatHeaderOptions,
	isDocked,
	isOpen,
	onClose,
	onExpand,
	markdownComponents = {},
	markdownExtensions = {},
}: Props ) {
	const {
		site,
		zendeskConversationTags,
		zendeskSmoochIntegrationKey,
		zendeskTicketProductFieldValue,
	} = useAgentsManagerContext();
	const siteUrl = getSiteUrl( site );
	const conversationTicketFields = useMemo(
		() =>
			zendeskTicketProductFieldValue
				? {
						[ ZENDESK_CUSTOM_FIELD_WEBSITE_URL ]: siteUrl,
						[ ZENDESK_SOURCE_URL_TICKET_FIELD_ID ]: window.location.href,
						[ ZENDESK_CUSTOM_FIELD_PRODUCT ]: zendeskTicketProductFieldValue,
				  }
				: {},
		[ siteUrl, zendeskTicketProductFieldValue ]
	);
	const {
		agentticMessages,
		onSubmit,
		isLoadingConversation,
		isProcessing,
		onTypingStatusChange,
		imageUpload,
		supportedImageTypes,
		notice,
		hasInteractionEnded,
	} = useManagedZendeskChat( {
		conversationTags: zendeskConversationTags,
		conversationTicketFields,
		smoochIntegrationKey: zendeskSmoochIntegrationKey,
	} );

	return (
		<AgentChat
			messages={ agentticMessages as Message[] }
			suggestions={ [] }
			isProcessing={ isProcessing }
			error={ null }
			onSubmit={ onSubmit }
			isLoadingConversation={ isLoadingConversation }
			isDocked={ isDocked }
			onAbort={ () => {} }
			isOpen={ isOpen }
			onClose={ onClose }
			notice={ notice }
			onExpand={ onExpand }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			onTypingStatusChange={ onTypingStatusChange }
			imageUpload={ imageUpload }
			acceptedImageFileTypes={ supportedImageTypes }
			alternativeFooter={ hasInteractionEnded ? <ConcludedConversationFooter /> : undefined }
			// Zendesk conversations connect the user to a human Happiness
			// Engineer, so the "You're chatting with AI" disclosure must not show.
			complianceDisclosure={ false }
		/>
	);
}
