import { EscalationButton } from '../components/escalation-button';
import UnavailableToolMessage from '../components/unavailable-tool-message';
import { CHECKPOINT_ACTION_ID } from '../hooks/use-checkpoint-action';
import { isEditorPage } from './is-editor-page';
import type { GetChatComponent } from './load-external-providers';
import type { UIMessage } from '@automattic/agenttic-client';

// Tool IDs that are silently dropped without a console warning.
const SILENT_TOOL_IDS = [ 'big_sky__set_processing_state' ];

interface Options {
	messages: UIMessage[];
	getChatComponent?: GetChatComponent;
	currentPostId?: number;
}

/**
 * Converts tool-related messages to component messages.
 */
export function convertToolMessagesToComponents( {
	messages,
	getChatComponent,
	currentPostId,
}: Options ): UIMessage[] {
	return messages.flatMap( ( message, index, array ) => {
		const firstContentText = message.content?.[ 0 ]?.text;

		// @ts-expect-error -- `assistant` comes from Big Sky messages
		if ( ( message.role !== 'agent' && message.role !== 'assistant' ) || ! firstContentText ) {
			return [ message ];
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
						component: EscalationButton,
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

		// Handle `show-component` tool message
		if ( textData.tool_id === 'big_sky__show_component' ) {
			// If not on an editor page, show an unavailable tool message instead of the component
			if ( ! isEditorPage() ) {
				return [
					{
						...message,
						content: [
							{
								type: 'component' as const,
								component: UnavailableToolMessage as React.ComponentType,
								componentProps: { type: 'picker' },
							},
						],
					},
				];
			}

			const { type: contentType, props, followUpTasks, isCurrent, postId } = textData.data ?? {};
			const Component = getChatComponent?.( contentType );

			// No matching component found for this content type — drop the message to avoid showing raw JSON.
			if ( ! Component ) {
				return [];
			}

			// Whether this is the last message in the array.
			const isLastMessage = index === array.length - 1;

			// In the site editor, React-Query caching keeps past conversations alive when the
			// user navigates to a different page. Compare the picker's `postId` with the
			// current editor page to disable pickers that no longer belong to this page.
			const isPageChanged = !! postId && !! currentPostId && postId !== currentPostId;
			const isStale = ! isLastMessage || ! isCurrent || isPageChanged;

			const componentMessage = {
				...message,
				content: [
					{
						type: 'component' as const,
						component: Component,
						componentProps: { ...props, contentType },
					},
				],
				disabled: isStale,
				// Tag for `deactivateStaleMessages` to disable on back-navigation.
				isShowComponentMessage: true,
			};

			// Only show `next-step-button` when the component is active and has follow-up tasks.
			const NextStepButton = getChatComponent?.( 'next-step-button' );
			if ( isStale || ! followUpTasks || ! NextStepButton ) {
				return [ componentMessage ];
			}

			return [
				componentMessage,
				{
					...message,
					id: `${ message.id }-next-step`,
					content: [
						{
							type: 'component' as const,
							component: NextStepButton,
						},
					],
					// Tag for `deactivateStaleMessages` to remove on back-navigation.
					isNextStepButton: true,
				},
			];
		}

		// Handle `apply-block-edits` tool message
		if (
			textData.tool_id === 'big_sky__apply_block_edits' &&
			typeof textData.data?.summary === 'string'
		) {
			return [
				{
					...message,
					content: [
						{
							type: 'text' as const,
							text: textData.data.summary.trim(),
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
							component: UnavailableToolMessage as React.ComponentType,
							componentProps: { type: 'start-over' },
						},
					],
				},
			];
		}

		// Remove unhandled tool messages to avoid displaying raw JSON to the user.
		if ( ! SILENT_TOOL_IDS.includes( textData.tool_id ) ) {
			// eslint-disable-next-line no-console
			console.warn( `[Agents Manager] Unhandled tool message with tool_id: ${ textData.tool_id }` );
		}
		return [];
	} );
}

// Deactivates messages that should no longer be interactive when caching.
export function deactivateStaleMessages( messages: UIMessage[] ): UIMessage[] {
	return messages
		.filter( ( message ) => {
			// @ts-ignore -- custom flag not on the `UIMessage` type.
			// Remove next-step buttons.
			return ! message.isNextStepButton;
		} )
		.map( ( message ) => {
			let updated = message;

			// Strip the undo (checkpoint) action so it won't reappear on cached messages.
			if ( updated.actions?.length ) {
				updated = {
					...updated,
					actions: updated.actions.filter( ( action ) => action.id !== CHECKPOINT_ACTION_ID ),
				};
			}

			// @ts-ignore -- custom flag not on the `UIMessage` type.
			// Disable picker components so they become non-interactive.
			if ( updated.isShowComponentMessage ) {
				return { ...updated, disabled: true };
			}

			return updated;
		} );
}
