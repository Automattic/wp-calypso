import { __ } from '@wordpress/i18n';
import ButtonPicker from '../components/button-picker';
import ColorPicker from '../components/color-picker';
import { EscalationButton } from '../components/escalation-button';
import FontPicker from '../components/font-picker';
import { isShowComponentTool } from './show-component-tools';
import { getDisplayMessageFromToolData, isDisplayableToolMessageTool } from './tool-message-utils';
import type { GetChatComponent } from './load-external-providers';
import type { ShowComponentType } from '../abilities/show-component';
import type { UIMessage } from '@automattic/agenttic-client';

export interface AgentsManagerUIMessage extends UIMessage {
	disabled?: boolean;
	traceId?: string;
	/** Suppress Agenttic's transient thinking indicator while this message is the latest one. */
	suppressThinking?: boolean;
}

// AM-owned components by `ShowComponentType`. These take precedence over
// provider components — AM is the single source of truth for each migrated type.
const AM_COMPONENTS: Record< ShowComponentType, React.ComponentType > = {
	'button-picker': ButtonPicker as React.ComponentType,
	'color-picker': ColorPicker as React.ComponentType,
	'font-picker': FontPicker as React.ComponentType,
};

function getAmComponent( type: string ): React.ComponentType | null {
	// Own-property check so degenerate types (e.g. `toString`) can't resolve
	// to `Object.prototype` members.
	return Object.hasOwn( AM_COMPONENTS, type ) ? AM_COMPONENTS[ type as ShowComponentType ] : null;
}

interface Options {
	messages: UIMessage[];
	getChatComponent?: GetChatComponent;
	currentPostId?: number | string;
}

interface MessageWithContextFlags extends UIMessage {
	context?: {
		flags?: {
			context_only?: boolean;
		};
	};
}

function isContextOnlyMessage( message: UIMessage ): boolean {
	return (
		( message as MessageWithContextFlags ).context?.flags?.context_only === true ||
		message.content?.some( ( content ) => {
			if ( content.type === 'context' ) {
				return true;
			}

			const flags =
				content.type === 'data' ? ( content.data?.flags as { context_only?: boolean } ) : undefined;
			return flags?.context_only === true;
		} )
	);
}

function getShowComponentSummary( message: UIMessage ): string | undefined {
	const firstText = message.content?.[ 0 ]?.text;
	if ( ! firstText ) {
		return undefined;
	}

	try {
		const parsed = JSON.parse( firstText );
		if ( ! isShowComponentTool( parsed?.tool_id ) ) {
			return undefined;
		}

		const summary = parsed?.data?.summary;
		return typeof summary === 'string' ? summary.trim() || undefined : undefined;
	} catch ( _error ) {
		return undefined;
	}
}

function hasAgentRole( message: UIMessage ): boolean {
	const role = message.role as string;
	return role === 'agent' || role === 'assistant';
}

function isUnsuccessfulToolData( data: unknown ): boolean {
	return (
		typeof data === 'object' && data !== null && ( data as { success?: unknown } ).success === false
	);
}

function isDuplicateAdjacentShowComponentSummary(
	message: UIMessage,
	messages: UIMessage[],
	index: number
): boolean {
	const text = message.content?.[ 0 ]?.text?.trim();
	if ( ! text ) {
		return false;
	}

	const adjacentMessages = [ messages[ index - 1 ], messages[ index + 1 ] ].filter( Boolean );
	return adjacentMessages.some(
		( adjacentMessage ) => getShowComponentSummary( adjacentMessage ) === text
	);
}

function hasLaterAgentToolMessageInSameTurn(
	messages: UIMessage[],
	currentIndex: number
): boolean {
	for ( const laterMessage of messages.slice( currentIndex + 1 ) ) {
		if ( laterMessage.role === 'user' ) {
			return false;
		}

		if ( ! hasAgentRole( laterMessage ) ) {
			continue;
		}

		const laterText = laterMessage.content?.[ 0 ]?.text;
		if ( ! laterText ) {
			continue;
		}

		try {
			const laterData = JSON.parse( laterText );
			if ( typeof laterData?.tool_id === 'string' ) {
				return true;
			}
		} catch ( _error ) {}
	}

	return false;
}

// The legacy `start over` tool is gone — ask the user to resend instead.
const StartOverMessage = () => (
	<p>{ __( 'To start over, please send your request again.', __i18n_text_domain__ ) }</p>
);

/**
 * Converts tool-related messages to component messages.
 */
export default function convertToolMessagesToComponents( {
	messages,
	getChatComponent,
	currentPostId,
}: Options ): AgentsManagerUIMessage[] {
	return messages.flatMap( ( message, index, array ) => {
		if ( isContextOnlyMessage( message ) ) {
			return [];
		}

		const firstContentText = message.content?.[ 0 ]?.text;

		if ( ! hasAgentRole( message ) || ! firstContentText ) {
			return [ message ];
		}

		if ( isDuplicateAdjacentShowComponentSummary( message, array, index ) ) {
			return [];
		}

		// The user asked for human support
		if (
			message.content.find(
				( content ) =>
					content.type === 'data' &&
					content.data?.flags &&
					typeof content.data.flags === 'object' &&
					'forward_to_human_support' in content.data.flags
			)
		) {
			return {
				...message,
				content: [
					{
						type: 'component',
						component: EscalationButton as React.ComponentType,
						componentProps: {
							messageId: message.id,
						},
					},
				],
			};
		}

		// The tool message is a JSON string. Try to parse it, falling back to the original if invalid
		let textData;
		try {
			textData = JSON.parse( firstContentText );
		} catch ( _error ) {
			return [ message ];
		}

		if (
			typeof textData !== 'object' ||
			textData === null ||
			typeof textData.tool_id !== 'string'
		) {
			return [ message ];
		}

		// Handle `show-component` tool message
		if ( isShowComponentTool( textData.tool_id ) ) {
			const toolData = textData.data ?? {};
			const { type: contentType, props, followUpTasks, isCurrent, postId, summary } = toolData;
			// Big Sky's pattern picker no longer renders in AM chats (its backend
			// ability is Easy-Site-Editor-only) — history messages get the notice below.
			// TODO: Remove once Big Sky drops its pattern-picker chat component; the
			// provider fallthrough then resolves nothing and the notice happens on its own.
			const isDeprecatedType = contentType === 'pattern-picker';
			const amComponent = getAmComponent( contentType );
			// AM components take precedence; other types resolve through the external
			// providers (e.g. jetpack-ai-sidebar's title pickers) via `getChatComponent`.
			const Component = isDeprecatedType ? null : amComponent ?? getChatComponent?.( contentType );
			// Provider components resolve by `contentType`; AM components are pre-resolved.
			const ownerProps = amComponent ? {} : { contentType };

			const summaryText = typeof summary === 'string' ? summary.trim() || undefined : undefined;

			// No matching component on either side (e.g. a deprecated type in
			// restored history) — show the stored summary or a short notice
			// instead of raw JSON.
			if ( ! Component ) {
				return [
					{
						...message,
						content: [
							{
								type: 'text' as const,
								text:
									summaryText ?? __( 'This option is no longer available.', __i18n_text_domain__ ),
							},
						],
						suppressThinking: true,
					},
				];
			}

			// A picker only stays interactive until the user replies past it — after
			// that it documents a previous step. Hidden context messages (e.g.
			// navigation continuations) are not real replies.
			const hasUserReplied = array
				.slice( index + 1 )
				.some(
					( laterMessage ) => laterMessage.role === 'user' && ! isContextOnlyMessage( laterMessage )
				);

			// In the site editor, React-Query caching keeps past conversations alive when the
			// user navigates to a different page. Compare the picker's `postId` with the
			// current editor page to disable pickers that no longer belong to this page.
			const isPageChanged =
				!! postId && !! currentPostId && String( postId ) !== String( currentPostId );
			const isStale = hasUserReplied || ! isCurrent || isPageChanged;

			const componentMessage: AgentsManagerUIMessage = {
				...message,
				content: [
					...( summaryText
						? [
								{
									type: 'text' as const,
									text: summaryText,
								},
						  ]
						: [] ),
					{
						type: 'component' as const,
						component: Component,
						componentProps: {
							...props,
							...( summaryText && { summary: summaryText } ),
							...ownerProps,
							...( isStale && { isMessageStale: true } ),
						},
					},
				],
				disabled: isStale,
				suppressThinking: followUpTasks !== true,
			};

			return [ componentMessage ];
		}

		// Handle agent-facing Big Sky tool result summaries.
		if ( isDisplayableToolMessageTool( textData.tool_id ) ) {
			if ( isUnsuccessfulToolData( textData.data ) ) {
				return [];
			}

			const summary = getDisplayMessageFromToolData( textData.data );
			if ( ! summary ) {
				return [];
			}

			// Tool summaries with follow-up tasks are intermediate status updates. When
			// rehydrating history, a later tool message in the same user turn (for example,
			// a color picker) should be the visible response instead of replaying this
			// intermediate confirmation.
			if (
				( textData.data as { followUpTasks?: unknown } )?.followUpTasks === true &&
				hasLaterAgentToolMessageInSameTurn( array, index )
			) {
				return [];
			}

			return [
				{
					...message,
					suppressThinking: true,
					content: [
						{
							type: 'text' as const,
							text: summary,
						},
					],
				},
			];
		}

		// Handle `wordpress-com-support` tool message
		if (
			textData.tool_id === 'big_sky__wordpress_com_support' &&
			typeof textData.data === 'string'
		) {
			return [
				{
					...message,
					content: [
						{
							type: 'text' as const,
							text: textData.data,
						},
					],
				},
			];
		}

		// Handle start over tool message
		// TODO: Remove this branch and `StartOverMessage` when the
		// `client-assistants` ability migrates (it is offered by no orchestrator
		// route today — only old history rows carry it).
		if (
			textData.tool_id === 'big_sky__client_assistants' &&
			textData.data?.assistantId === 'big-sky-site-admin'
		) {
			return [
				{
					...message,
					content: [
						{
							type: 'component' as const,
							component: StartOverMessage as React.ComponentType,
							componentProps: {},
						},
					],
				},
			];
		}

		// Remove unhandled tool messages to avoid displaying raw JSON to the user.
		// eslint-disable-next-line no-console
		console.warn( `[AgentsManager] Unhandled tool message with tool_id: ${ textData.tool_id }` );
		return [];
	} );
}
