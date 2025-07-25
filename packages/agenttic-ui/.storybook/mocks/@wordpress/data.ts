import type { Message } from '../../../src/types';
import React from 'react';

let mockMessages: Message[] = [];
let mockIsThinking = false;
let mockIsSendingMessage = false;
let mockError: string | null = null;
let mockInputValue = '';
let mockSuggestions: any[] = [
	{ id: '1', prompt: 'Show me my sales data', label: 'View Sales' },
	{ id: '2', prompt: 'What are my top products?', label: 'Top Products' },
];
let mockMarkdownComponents: any = {};
let mockMarkdownExtensions: any = {};

const mockStore = {
	getMessages: () => mockMessages,
	getIsThinking: () => mockIsThinking,
	getIsSendingMessage: () => mockIsSendingMessage,
	getIsTyping: () => false,
	getError: () => mockError,
	getAssistant: () => null,
	getPendingToolCallbacks: () => [],
	getCurrentToolCall: () => null,
	getInputValue: () => mockInputValue,
	getRegisteredSuggestions: () => mockSuggestions,
	getRegisteredMarkdownComponents: () => mockMarkdownComponents,
	getRegisteredMarkdownExtensions: () => mockMarkdownExtensions,
};

const mockActions = {
	runAgent: async ( message: string ) => {
		mockMessages = [
			...mockMessages,
			{
				id: Date.now().toString(),
				content: [ { type: 'text', text: message } ],
				role: 'user',
				created_at: Date.now(),
				archived: false,
				showIcon: true,
			},
		];
		mockIsSendingMessage = true;
		mockInputValue = '';
		notifySubscribers();

		setTimeout( () => {
			mockIsThinking = true;
			mockIsSendingMessage = false;
			notifySubscribers();
		}, 300 );

		setTimeout( () => {
			const responses = [
				`I can help you with that! Based on your request about "${ message }", here's what I found...`,
				`Great question! Let me analyze "${ message }" for you.`,
				`I understand you're asking about "${ message }". Here's my analysis...`,
				`Looking into "${ message }" for you. Here's what the data shows...`,
			];

			mockMessages = [
				...mockMessages,
				{
					id: ( Date.now() + 1 ).toString(),
					content: [
						{
							type: 'text',
							text: responses[
								Math.floor( Math.random() * responses.length )
							],
						},
					],
					role: 'assistant',
					created_at: Date.now() + 1,
					archived: false,
					showIcon: true,
				},
			];
			mockIsThinking = false;
			notifySubscribers();
		}, 1500 );
	},
	addUserMessage: ( message: Message ) => {
		if ( typeof message.content === 'string' ) {
			message.content = [ { type: 'text', text: message.content } ];
		}
		mockMessages = [ ...mockMessages, message ];
	},
	assistantSay: ( content: string ) => {
		mockMessages = [
			...mockMessages,
			{
				id: Date.now().toString(),
				content: [ { type: 'text', text: content } ],
				role: 'assistant',
				created_at: Date.now(),
				archived: false,
				showIcon: true,
			},
		];
	},
	addMessage: ( message: Message ) => {
		if ( typeof message.content === 'string' ) {
			message.content = [ { type: 'text', text: message.content } ];
		}
		mockMessages = [ ...mockMessages, message ];
	},
	deleteMessage: ( id: string ) => {
		mockMessages = mockMessages.filter( ( m ) => m.id !== id );
	},
	clearMessages: () => {
		mockMessages = [];
	},
	setThinking: ( thinking: boolean ) => {
		mockIsThinking = thinking;
	},
	setError: ( error: string | null ) => {
		mockError = error;
	},
	clearAgents: () => {},
	removeAgent: () => {},
	resetConversation: () => {
		mockMessages = [];
		mockError = null;
		mockIsThinking = false;
		mockIsSendingMessage = false;
	},
	setInputValue: ( value: string ) => {
		mockInputValue = value;
		notifySubscribers();
	},
	loadConversationHistory: ( agentKey: string ) => {
		console.log( `Loading conversation history for agent: ${ agentKey }` );
	},
	initializeAgent: () => {
		console.log( 'Initializing agent' );
	},
	registerSuggestions: ( suggestions: any[] ) => {
		mockSuggestions = suggestions;
		notifySubscribers();
	},
	clearSuggestions: () => {
		mockSuggestions = [];
		notifySubscribers();
	},
	setIsTyping: ( isTyping: boolean ) => {
		console.log( 'Set typing:', isTyping );
	},
	registerMarkdownComponents: ( components: any ) => {
		mockMarkdownComponents = { ...mockMarkdownComponents, ...components };
		console.log( 'Registering markdown components:', components );
		notifySubscribers();
	},
	registerMarkdownExtensions: ( extensions: any ) => {
		mockMarkdownExtensions = { ...mockMarkdownExtensions, ...extensions };
		console.log( 'Registering markdown extensions:', extensions );
		notifySubscribers();
	},
	clearMarkdownComponents: () => {
		mockMarkdownComponents = {};
		console.log( 'Clearing markdown components' );
		notifySubscribers();
	},
	clearMarkdownExtensions: () => {
		mockMarkdownExtensions = {};
		console.log( 'Clearing markdown extensions' );
		notifySubscribers();
	},
};

let subscribers: Function[] = [];

const notifySubscribers = () => {
	subscribers.forEach( ( callback ) => callback() );
};

export const useSelect = ( callback: Function, deps?: any[] ) => {
	const [ , forceUpdate ] = React.useReducer( ( x: number ) => x + 1, 0 );

	React.useEffect( () => {
		const subscriber = () => forceUpdate();
		subscribers.push( subscriber );

		return () => {
			subscribers = subscribers.filter( ( s ) => s !== subscriber );
		};
	}, [] );

	const mockSelect = ( storeName: string ) => {
		if ( storeName === 'a8c-agenttic-ui' ) {
			return mockStore;
		}
		return {};
	};
	return callback( mockSelect );
};

export const useDispatch = ( storeName: string ) => {
	if ( storeName === 'a8c-agenttic-ui' ) {
		return mockActions;
	}
	return {};
};

export const select = ( storeName: string ) => {
	if ( storeName === 'a8c-agenttic-ui' ) {
		return mockStore;
	}
	return {};
};

export const dispatch = ( storeName: string ) => {
	if ( storeName === 'a8c-agenttic-ui' ) {
		return mockActions;
	}
	return {};
};

export const createSelector = ( selector: Function, getDependencies?: Function ) => {
	// Simple mock implementation that just returns the selector
	return selector;
};

export const createRegistrySelector = () => {};
export const createRegistryControl = () => {};
export const combineReducers = () => {};
export const registerStore = () => {};
export const register = () => {};
export const createReduxStore = () => ( {
	getActions: () => ( {} ),
	getSelectors: () => ( {} ),
	getReducer: () => () => ( {} ),
} );
