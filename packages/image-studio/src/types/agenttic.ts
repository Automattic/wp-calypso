/**
 * Minimal Agenttic message type used within Image Studio.
 */
export type AgentMessage = {
	id?: string;
	role?: string;
	[ key: string ]: any;
};
