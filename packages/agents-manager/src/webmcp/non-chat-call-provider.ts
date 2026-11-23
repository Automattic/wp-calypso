import type { ToolProvider } from '../extension-types';

/**
 * Marks each provider call as one no chat made (`toolCallId: null`), so `withCheckpoint()`
 * doesn't file its edits under the chat's last call. Registry and server abilities aren't
 * wrapped: their input schemas may refuse the extra key.
 */
export function withoutChatToolCalls( toolProvider: ToolProvider ): ToolProvider {
	return {
		getAbilities: () => toolProvider.getAbilities(),
		executeAbility: ( name, input ) =>
			toolProvider.executeAbility( name, { ...input, toolCallId: null } ),
	};
}
