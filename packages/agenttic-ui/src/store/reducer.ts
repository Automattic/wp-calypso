import type { AgentChatState } from './types';

const DEFAULT_STATE: AgentChatState = {
	messages: [],
	isThinking: false,
	isSendingMessage: false,
	isTyping: false,
	messagesToDelete: [],
	assistant: '',
	pendingToolCallbacks: 0,
	currentToolCall: '',
	error: null,
};

export const reducer = (
	state = DEFAULT_STATE,
	action: any
): AgentChatState => {
	switch ( action.type ) {
		case 'SET_MESSAGES':
			return {
				...state,
				messages: action.messages,
			};

		case 'ADD_MESSAGE':
			return {
				...state,
				messages: [ ...state.messages, action.message ],
			};

		case 'DELETE_MESSAGE':
			return {
				...state,
				messages: state.messages.filter(
					( message ) => message.id !== action.id
				),
			};

		case 'CLEAR_MESSAGES':
			return {
				...state,
				messages: [],
			};

		case 'SET_THINKING':
			return {
				...state,
				isThinking: action.isThinking,
			};

		case 'SET_SENDING_MESSAGE':
			return {
				...state,
				isSendingMessage: action.isSendingMessage,
			};

		case 'SET_TYPING':
			return {
				...state,
				isTyping: action.isTyping,
			};

		case 'SET_ASSISTANT':
			return {
				...state,
				assistant: action.assistant,
			};

		case 'SET_PENDING_TOOL_CALLBACKS':
			return {
				...state,
				pendingToolCallbacks: action.count,
			};

		case 'SET_CURRENT_TOOL_CALL':
			return {
				...state,
				currentToolCall: action.toolCall,
			};

		case 'SET_ERROR':
			return {
				...state,
				error: action.error,
			};

		case 'ADD_MESSAGE_TO_DELETE':
			return {
				...state,
				messagesToDelete: [ ...state.messagesToDelete, action.message ],
			};

		case 'CLEAR_MESSAGES_TO_DELETE':
			return {
				...state,
				messagesToDelete: [],
			};

		default:
			return state;
	}
};

export default reducer;
