/**
 * Minimal Agenttic message type used within Image Studio.
 * Defines only the properties that Image Studio directly accesses.
 * Additional properties from the Agenttic UI library are allowed via
 * structural typing (duck typing) - we don't enforce their types here.
 */
export interface AgentMessage {
	id?: string;
	role?: string;
}
