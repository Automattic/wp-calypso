# @automattic/agents-manager

Unified AI Agent manager for WordPress and Calypso.

## Features

- **Unified AI Agent**: A complete AI chat interface with docking and floating modes.
- **Conversation History**: View and resume past conversations.
- **Session Management**: Automatic session handling with persistence.
- **Extensible**: Support for custom tools, context providers, and markdown components.
- **Multi-Context Support**: Works in WordPress (wp-admin, block-editor, site-editor), Calypso, and generic contexts.

## Installation

```bash
yarn add @automattic/agents-manager
```

## Usage

### UnifiedAIAgent

The main component is `UnifiedAIAgent`. It handles the initialization of the agent, session management, and UI rendering.

```tsx
import UnifiedAIAgent from '@automattic/agents-manager';

function MyApp() {
  return (
    <UnifiedAIAgent
      currentRoute="/my-route"
      currentUser={ currentUser }
      site={ site }
      // Optional: Provide custom tools
      toolProvider={ myToolProvider }
      // Optional: Provide custom context
      contextProvider={ myContextProvider }
      // Optional: Custom suggestions for empty view
      emptyViewSuggestions={ [
        { label: 'Help me write', prompt: 'Help me write a blog post about...' }
      ] }
    />
  );
}
```

## API Reference

### UnifiedAIAgent Props

| Prop | Type | Description |
| --- | --- | --- |
| `currentRoute` | `string` | The current route path. |
| `sectionName` | `string` | The name of the current section (e.g., 'posts', 'pages'). |
| `site` | `object` | The selected site object. |
| `currentUser` | `object` | The current user object. |
| `handleClose` | `() => void` | Callback to handle closing the agent. |
| `toolProvider` | `ToolProvider` | Provider for custom tools/abilities. |
| `contextProvider` | `ContextProvider` | Provider for environment-specific context. |
| `emptyViewSuggestions` | `Suggestion[]` | Custom suggestions for the empty view. |
| `markdownComponents` | `MarkdownComponents` | Custom markdown renderers. |
| `markdownExtensions` | `MarkdownExtensions` | Custom markdown extensions. |

## Architecture

The package is built around several key components:

- **UnifiedAIAgent**: The top-level wrapper that configures the agent.
- **AgentDock**: Manages the chat UI, docking state, and session logic.
- **ConversationHistoryView**: Displays past conversations and allows switching between them.
- **useAgentSession**: Manages session persistence and lifecycle.
- **useLoadConversation**: Handles loading conversation history from the server.

## Extension API

You can extend the agent's capabilities using providers.

### ToolProvider

Allows registering custom tools (abilities) that the agent can use.

```typescript
const myToolProvider: ToolProvider = {
    getTools: async () => {
        return [
            {
                name: 'my_custom_tool',
                description: 'Does something cool',
                execute: async ( params ) => {
                    // ...
                }
            }
        ];
    }
};
```

### ContextProvider

Allows providing additional context to the agent.

```typescript
const myContextProvider: ContextProvider = {
    getContext: async () => {
        return [
            {
                type: 'application_state',
                data: {
                    currentView: 'editor',
                    // ...
                }
            }
        ];
    }
};
```

## Development

```bash
# Build the package
yarn build

# Watch for changes
yarn watch

# Clean build output
yarn clean
```

## License

GPL-2.0-or-later

