import * as jest from 'jest-mock';
import { OdieAssistantContextInterface } from '..';
import { Message, Chat, Nudge, OdieAllowedBots } from '../../types';

const mockMessage: Message = {
	type: 'message',
	message_id: 1,
	content: 'Mock message',
	role: 'user',
};

const mockChat: Chat = {
	chat_id: 1,
	messages: [ mockMessage ],
};

const mockNudge: Nudge = {
	nudge: 'nudge',
	initialMessage: 'Mock initial message',
};

export const mockOdieAssistantProviderProps: OdieAssistantContextInterface = {
	botName: 'Mock Bot',
	botNameSlug: 'mock-bot-slug' as OdieAllowedBots,
	initialUserMessage: 'Hello, this is a mock message',
	isMinimized: false,
	extraContactOptions: <div>Mock Extra Contact Options</div>,
	addMessage: jest.fn(),
	chat: mockChat,
	clearChat: jest.fn(),
	isLoadingChat: false,
	isLoading: false,
	isNudging: false,
	isVisible: false,
	lastNudge: mockNudge,
	sendNudge: jest.fn(),
	setChat: jest.fn(),
	setIsLoadingChat: jest.fn(),
	setMessageLikedStatus: jest.fn(),
	setContext: jest.fn(),
	setIsNudging: jest.fn(),
	setIsVisible: jest.fn(),
	setIsLoading: jest.fn(),
	trackEvent: jest.fn(),
	updateMessage: jest.fn(),
};
