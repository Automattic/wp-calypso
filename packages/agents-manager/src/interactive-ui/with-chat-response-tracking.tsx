import { useMemo } from '@wordpress/element';
import ChatResponseRenderedTracker, {
	createChatResponseActionCallback,
} from '../components/chat-response-tracking';
import { INTERACTIVE_UI_TOOL_ID } from './messages';
import type { ComponentType } from 'react';

interface InteractiveUiComponentProps {
	surfaceId?: string;
	isMessageStale?: boolean;
}

/**
 * Wraps an interactive UI component so it records the shared response events, as a
 * `show-component` message does: rendered once while current, and the actions it reports through
 * `onResponseAction`.
 */
export function withChatResponseTracking(
	componentType: string,
	// A catalog holds components with different props types.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Component: ComponentType< any >
) {
	function TrackedComponent( props: InteractiveUiComponentProps ) {
		const { surfaceId, isMessageStale } = props;

		const onResponseAction = useMemo(
			() =>
				isMessageStale
					? undefined
					: createChatResponseActionCallback( {
							componentType,
							toolId: INTERACTIVE_UI_TOOL_ID,
							toolCallId: surfaceId,
						} ),
			[ isMessageStale, surfaceId ]
		);

		return (
			<>
				<Component { ...props } onResponseAction={ onResponseAction } />
				{ ! isMessageStale && (
					<ChatResponseRenderedTracker
						componentType={ componentType }
						toolId={ INTERACTIVE_UI_TOOL_ID }
						toolCallId={ surfaceId }
					/>
				) }
			</>
		);
	}

	return TrackedComponent;
}
