/**
 * V2 Hooks - Refactored implementation using derived state pattern
 *
 * This folder contains the refactored version of use-get-combined-chat
 * and related hooks. These are separate from the existing implementation
 * to allow for testing and gradual migration.
 *
 * To use these hooks, import from this folder:
 * import { useGetCombinedChat } from './hooks/v2';
 */

export { useChatMessages } from './use-chat-messages';
export { useChatStatusFlags } from './use-chat-status-flags';
export { useChatDerivedState } from './use-chat-derived-state';
export { useInteractionSync } from './use-interaction-sync';
export { useOdieChatSync } from './use-odie-chat-sync';
export { useZendeskChatSync } from './use-zendesk-chat-sync';
export { useGetCombinedChat } from './use-get-combined-chat';
