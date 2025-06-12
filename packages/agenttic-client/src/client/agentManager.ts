import type {
	Client,
	ClientConfig,
	SendMessageParams,
	Task,
	Message,
} from './types/index';
import { createClient } from './index';
import { createTextMessage } from './utils/index';

/**
 * Configuration for agent manager
 */
export interface AgentManagerConfig extends ClientConfig {
	key?: string;
}

/**
 * Agent manager interface
 */
export interface AgentManager {
	createAgent: (key: string, config: ClientConfig) => Client;
	getAgent: (key: string) => Client | null;
	hasAgent: (key: string) => boolean;
	removeAgent: (key: string) => boolean;
	sendMessage: (
		key: string,
		message: string,
		options?: Partial<SendMessageParams>
	) => Promise<Task>;
	sendMessageStream: (
		key: string,
		message: string,
		options?: Partial<SendMessageParams>
	) => AsyncIterable<any>;
	clear: () => void;
}

/**
 * Create a functional agent manager using closures
 */
function createAgentManager(): AgentManager {
	// Private state using closure
	const agents = new Map<string, Client>();

	return {
		createAgent(key: string, config: ClientConfig): Client {
			if (agents.has(key)) {
				return agents.get(key)!;
			}

			const client = createClient(config);
			agents.set(key, client);
			return client;
		},

		getAgent(key: string): Client | null {
			return agents.get(key) || null;
		},

		hasAgent(key: string): boolean {
			return agents.has(key);
		},

		removeAgent(key: string): boolean {
			return agents.delete(key);
		},

		async sendMessage(
			key: string,
			message: string,
			options: Partial<SendMessageParams> = {}
		): Promise<Task> {
			const agent = agents.get(key);
			if (!agent) {
				throw new Error(`Agent with key "${key}" not found`);
			}

			const messageObj: Message = 
				options.message || createTextMessage(message);

			return agent.sendMessage({
				message: messageObj,
				...options,
			});
		},

		async *sendMessageStream(
			key: string,
			message: string,
			options: Partial<SendMessageParams> = {}
		): AsyncIterable<any> {
			const agent = agents.get(key);
			if (!agent) {
				throw new Error(`Agent with key "${key}" not found`);
			}

			const messageObj: Message = 
				options.message || createTextMessage(message);

			yield* agent.sendMessageStream({
				message: messageObj,
				...options,
			});
		},

		clear(): void {
			agents.clear();
		},
	};
}

// Global singleton instance
const globalAgentManager = createAgentManager();

/**
 * Get the global agent manager instance
 */
export function getAgentManager(): AgentManager {
	return globalAgentManager;
}

/**
 * Create a new isolated agent manager instance
 * Useful for testing or specific use cases where you need isolation
 */
export function createIsolatedAgentManager(): AgentManager {
	return createAgentManager();
}

/**
 * Convenience function to create an agent with a standard configuration
 */
export function createManagedAgent(
	key: string,
	config: AgentManagerConfig,
	manager: AgentManager = globalAgentManager
): Client {
	return manager.createAgent(key, config);
}

/**
 * Convenience function to send a message to a managed agent
 */
export async function sendManagedMessage(
	key: string,
	message: string,
	options?: Partial<SendMessageParams>,
	manager: AgentManager = globalAgentManager
): Promise<Task> {
	return manager.sendMessage(key, message, options);
}

/**
 * Convenience function to send a streaming message to a managed agent
 */
export async function* sendManagedMessageStream(
	key: string,
	message: string,
	options?: Partial<SendMessageParams>,
	manager: AgentManager = globalAgentManager
): AsyncIterable<any> {
	yield* manager.sendMessageStream(key, message, options);
} 