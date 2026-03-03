/**
 * Mock implementation of @automattic/agenttic-client for Jest tests
 */

// Export mock functions that tests can configure
export const mockHasAgent = jest.fn( () => true );
export const mockOnSubmit = jest.fn();

// Mock getAgentManager
export const getAgentManager = jest.fn( () => ( {
	hasAgent: mockHasAgent,
} ) );

// Mock useAgentChat hook
export const useAgentChat = jest.fn( () => ( {
	onSubmit: mockOnSubmit,
} ) );
