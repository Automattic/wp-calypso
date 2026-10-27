import { getToolMessageData } from './tool-message-utils';
import type { UIMessage } from '@automattic/agenttic-client';

export const BIG_SKY_SHOW_COMPONENT_TOOL_ID = 'big_sky__show_component';
export const JETPACK_AI_SHOW_COMPONENT_TOOL_ID = 'jetpack_ai__show_component';

const SHOW_COMPONENT_TOOL_IDS = [
	BIG_SKY_SHOW_COMPONENT_TOOL_ID,
	JETPACK_AI_SHOW_COMPONENT_TOOL_ID,
];

export function isShowComponentTool( toolId: unknown ): boolean {
	return typeof toolId === 'string' && SHOW_COMPONENT_TOOL_IDS.includes( toolId );
}

/**
 * Identifies a show-component message by its tool call and component, so the
 * same component can be matched across renders even when its message id changes.
 */
export function getShowComponentIdentity(
	message: Pick< UIMessage, 'content' >
): string | undefined {
	const toolData = getToolMessageData( message );
	if ( ! toolData || ! isShowComponentTool( toolData.toolId ) ) {
		return undefined;
	}

	return [ toolData.toolCallId, toolData.componentType, toolData.summary ]
		.filter( Boolean )
		.join( '|' );
}

/**
 * The show-component messages in `candidates` whose component is missing from
 * `liveMessages`, e.g. because a stream dropped it for a moment.
 */
export function getDroppedShowComponentMessages< Message extends Pick< UIMessage, 'content' > >(
	candidates: Message[],
	liveMessages: Pick< UIMessage, 'content' >[]
): Message[] {
	const liveIdentities = new Set( liveMessages.map( getShowComponentIdentity ).filter( Boolean ) );

	return candidates.filter( ( candidate ) => {
		const identity = getShowComponentIdentity( candidate );
		return !! identity && ! liveIdentities.has( identity );
	} );
}
