/**
 * @automattic/agenttic-client
 *
 * A TypeScript client library for Agenttic
 */

export interface AgentticClientConfig {
  apiKey?: string;
  baseUrl?: string;
}

export class AgentticClient {
  private config: AgentticClientConfig;

  constructor(config: AgentticClientConfig = {}) {
    this.config = {
      baseUrl: "https://api.agenttic.com",
      ...config,
    };
  }

  /**
   * Get the current configuration
   */
  getConfig(): AgentticClientConfig {
    return { ...this.config };
  }

  /**
   * Update the configuration
   */
  updateConfig(newConfig: Partial<AgentticClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export default instance
export default AgentticClient;
