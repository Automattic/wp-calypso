import { describe, it, expect } from "vitest";
import { AgentticClient } from "./index.js";

describe("AgentticClient", () => {
  it("should create a client with default config", () => {
    const client = new AgentticClient();
    const config = client.getConfig();

    expect(config.baseUrl).toBe("https://api.agenttic.com");
    expect(config.apiKey).toBeUndefined();
  });

  it("should create a client with custom config", () => {
    const customConfig = {
      apiKey: "test-key",
      baseUrl: "https://custom.api.com",
    };

    const client = new AgentticClient(customConfig);
    const config = client.getConfig();

    expect(config.apiKey).toBe("test-key");
    expect(config.baseUrl).toBe("https://custom.api.com");
  });

  it("should update config", () => {
    const client = new AgentticClient();

    client.updateConfig({ apiKey: "new-key" });
    const config = client.getConfig();

    expect(config.apiKey).toBe("new-key");
    expect(config.baseUrl).toBe("https://api.agenttic.com");
  });
});
