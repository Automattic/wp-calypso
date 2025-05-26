# @automattic/agenttic-client

A TypeScript client library for A2A (Agent2Agent) protocol communication. This package provides both a programmatic API and a CLI tool for interacting with Automattic agents.

## Features

-   🤖 **A2A Protocol Support**: Full implementation of the Agent2Agent protocol specification
-   🔄 **Streaming Support**: Real-time streaming responses via Server-Sent Events
-   🔐 **Flexible Authentication**: Pluggable auth providers for different authentication methods
-   🛠️ **CLI Tool**: Command-line interface for testing and debugging agent connections

## Installation

```bash
npm install @automattic/agenttic-client
```

For global CLI usage:

```bash
npm install -g @automattic/agenttic-client
```

## Quick Start

### Programmatic Usage

```typescript
import {
	createA2AClient,
	createTextMessage,
} from '@automattic/agenttic-client';

// Create a client
const client = createA2AClient( {
	agentUrl: 'https://your-agent.com/api',
	authProvider: async () => ( { Authorization: 'Bearer your-token' } ),
} );

// Send a simple message
const task = await client.sendMessage( {
	message: createTextMessage( 'Hello, agent!' ),
} );

console.log( 'Response:', task.status.message );

// Stream a response
for await ( const update of client.sendMessageStream( {
	message: createTextMessage( 'Tell me a story' ),
} ) ) {
	if ( update.status.message ) {
		console.log( 'Streaming:', update.status.message );
	}
}
```

### CLI Usage

```bash
# For WordPress.com Big Sky agent with Jetpack JWT
JETPACK_JWT=your-jwt-token agenttic-test --url https://public-api.wordpress.com/wpcom/v2/ai/agent/big-sky "Hello agent"

# For custom agents with Bearer token auth
agenttic-test --url https://my-agent.com/api --token abc123 "Hello agent"

# For internal development (no auth)
agenttic-test --url http://localhost:3000/api --no-auth "Test message"

# Streaming mode
agenttic-test --url https://my-agent.com/api --token abc123 --stream "Generate content"

# Interactive mode
agenttic-test --url https://my-agent.com/api --token abc123 --interactive

# Using .env file
# 1. Copy .env.example to .env
# 2. Add your JETPACK_JWT token to .env
# 3. Run: agenttic-test --url https://public-api.wordpress.com/wpcom/v2/ai/agent/big-sky "Hello"
```

> **Note**: The WordPress.com Big Sky agent now supports Jetpack JWT authentication via the `JETPACK_JWT` environment variable. Custom agent endpoints can use Bearer token authentication or no authentication.

## API Reference

### Core Client

#### `createA2AClient(config: A2AClientConfig): A2AClient`

Creates a new A2A client instance.

```typescript
interface A2AClientConfig {
	agentUrl: string;
	authProvider?: AuthProvider;
	defaultSessionId?: string;
	timeout?: number;
}
```

#### `A2AClient` Interface

```typescript
interface A2AClient {
	sendMessage( params: SendMessageParams ): Promise< Task >;
	sendMessageStream( params: SendMessageParams ): AsyncIterable< TaskUpdate >;
	getTask( taskId: string ): Promise< Task >;
	cancelTask( taskId: string ): Promise< void >;
}
```

### Message Builders

#### `createTextMessage(text: string): Message`

Creates a simple text message for sending to an agent.

#### `createTextPart(text: string): TextPart`

Creates a text part that can be included in messages.

### Authentication

#### `AuthProvider`

```typescript
interface AuthProvider {
	(): Promise< Record< string, string > >;
}
```

Create custom auth providers:

```typescript
const authProvider: AuthProvider = async () => {
	const token = await getTokenFromSomewhere();
	return { Authorization: `Bearer ${ token }` };
};
```

### Streaming

#### `parseSSEStream(stream: ReadableStream): AsyncIterable<TaskUpdate>`

Parse Server-Sent Events stream into task updates.

#### `streamToTask(stream: AsyncIterable<TaskUpdate>): Promise<Task>`

Convert a streaming response to a final task result.

## CLI Reference

### Options

-   `-u, --url <url>` - Agent URL (required for CLI usage)
-   `-t, --token <token>` - Authentication token
-   `-s, --session <id>` - Session ID for conversation continuity
-   `--timeout <ms>` - Request timeout in milliseconds
-   `--stream` - Enable streaming mode (real-time responses)
-   `--single` - Force single message mode (disable interactive)
-   `-v, --verbose` - Enable verbose output
-   `-h, --help` - Show help message

### Environment Variables

The CLI supports authentication via environment variables:

-   `JETPACK_JWT` - Jetpack JWT token (for WordPress.com agents)

### Examples

```bash

pnpm cli -a big-sky "What is your name?"

```

## TypeScript Support

This package is written in TypeScript and provides comprehensive type definitions:

```typescript
import type {
	A2AClient,
	Task,
	Message,
	TaskUpdate,
	AuthProvider,
	A2AClientConfig,
} from '@automattic/agenttic-client';
```

## Error Handling

The client provides detailed error information:

```typescript
try {
	const task = await client.sendMessage( {
		message: createTextMessage( 'Hello' ),
	} );
} catch ( error ) {
	if ( error.message.includes( 'Agent error:' ) ) {
		// Handle A2A protocol errors
	} else {
		// Handle network or other errors
	}
}
```

## A2A Protocol Compliance

This client implements the [A2A (Agent2Agent) Protocol](https://google.github.io/A2A/) specification, supporting:

-   JSON-RPC 2.0 message format
-   Task-based communication model
-   Server-Sent Events for streaming
-   Flexible message parts (text, files, data)
-   Session management
-   Error handling

## Contributing

This package is part of the Big Sky plugin project. See the main repository for contribution guidelines.

## License

MIT
