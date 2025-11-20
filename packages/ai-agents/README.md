# @automattic/ai-agents

AI agent dock and sidebar components with multi-context support for WordPress, Calypso, and generic environments.

## Features

- **AgentsManager**: Flexible sidebar/dock component using React Portal
- **Multi-Context Support**: Works in WordPress (wp-admin, block-editor, site-editor), Calypso, and generic contexts
- **Adapter System**: Pluggable adapters for context management
- **Ability Registry**: Async/programmatic API for registering agent abilities
- **Session Management**: Persistent session IDs with configurable expiry
- **Chat State**: Persistent chat expand/collapse state

## Installation

```bash
yarn add @automattic/ai-agents
```

## Quick Start

### Basic Usage

```tsx
import { AgentsManager, GenericContextAdapter } from '@automattic/ai-agents';

function MyApp() {
  return (
    <AgentsManager
      sidebarContainer="body"
      defaultOpen={ true }
    >
      { ( { isDocked, isDesktop, openSidebar, closeSidebar } ) => (
        <div>
          <h2>Agent Chat</h2>
          <p>Docked: { isDocked ? 'Yes' : 'No' }</p>
          {/* Your agent UI here */}
        </div>
      ) }
    </AgentsManager>
  );
}
```

### WordPress Context

```tsx
import {
  AgentsManager,
  WordPressContextAdapter,
} from '@automattic/ai-agents';

const contextAdapter = new WordPressContextAdapter( 'wp-admin' );

// Use in your component
<AgentsManager sidebarContainer="#wpwrap">
  { ( props ) => <YourAgentUI { ...props } /> }
</AgentsManager>
```

### Calypso Context

```tsx
import {
  AgentsManager,
  CalypsoContextAdapter,
} from '@automattic/ai-agents';

const contextAdapter = new CalypsoContextAdapter( 'calypso-help-center' );
```

## Hooks

### useChatState

Manages chat expand/collapse state with localStorage persistence.

```tsx
import { useChatState } from '@automattic/ai-agents';

function ChatComponent() {
  const { chatState, toggleExpand, collapse, expand } = useChatState( {
    storageKey: 'my-agent-chat-state',
    initialState: 'compact',
  } );

  return (
    <div>
      <p>State: { chatState }</p>
      <button onClick={ toggleExpand }>Toggle</button>
    </div>
  );
}
```

### useAgentSession

Manages persistent session IDs with expiry.

```tsx
import { useAgentSession } from '@automattic/ai-agents';

function AgentComponent() {
  const { sessionId, resetSession } = useAgentSession( {
    storageKey: 'my-agent-session',
    expiryMs: 24 * 60 * 60 * 1000, // 24 hours
    sessionIdPrefix: 'my-agent',
  } );

  return <div>Session: { sessionId }</div>;
}
```

## Ability Registry

The ability registry provides a flexible, async API for registering agent abilities.

```tsx
import { defaultAbilityRegistry } from '@automattic/ai-agents';

// Register abilities synchronously
defaultAbilityRegistry.registerAbility( {
  name: 'search',
  description: 'Search for content',
  execute: async ( params ) => {
    // Implementation
    return { results: [] };
  },
} );

// Register abilities asynchronously (lazy loading)
defaultAbilityRegistry.registerAbilitiesAsync( async () => {
  const wooAbilities = await import( './woo-abilities' );
  return wooAbilities.getAbilities();
} );

// Execute an ability
const result = await defaultAbilityRegistry.executeAbility( 'search', {
  query: 'hello',
} );
```

## Adapters

### Context Adapters

Context adapters provide environment-specific context to the AI agent.

- **GenericContextAdapter**: Basic URL/pathname context
- **WordPressContextAdapter**: WordPress-specific context (stores, entities)
- **CalypsoContextAdapter**: Calypso-specific context

```tsx
import { WordPressContextAdapter } from '@automattic/ai-agents';

const adapter = new WordPressContextAdapter( 'block-editor' );
const context = await adapter.getContext();
// { url, pathname, environment, additionalData }
```

## API Reference

### AgentsManager Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `(props: RenderProps) => ReactNode` | required | Render prop function |
| `sidebarContainer` | `string \| HTMLElement` | required | Target container for sidebar |
| `defaultUndocked` | `boolean` | `false` | Start in floating mode |
| `defaultOpen` | `boolean` | `false` | Open sidebar by default |
| `desktopMediaQuery` | `string` | `'(min-width: 1200px)'` | Desktop breakpoint |
| `classNamePrefix` | `string` | `'ai-agent'` | CSS class prefix |
| `fabIcon` | `ReactNode` | AI icon | FAB button icon |
| `fabLabel` | `string` | `'Open Chat'` | FAB button label |
| `onOpenSidebar` | `() => void` | - | Callback when opened |
| `onCloseSidebar` | `() => void` | - | Callback when closed |
| `onDock` | `() => void` | - | Callback when docked |
| `onUndock` | `() => void` | - | Callback when undocked |

### AgentsManager Render Props

| Prop | Type | Description |
|------|------|-------------|
| `isDocked` | `boolean` | Whether sidebar is docked |
| `isDesktop` | `boolean` | Whether viewport is desktop |
| `dock` | `() => void` | Dock the sidebar |
| `undock` | `() => void` | Undock to floating |
| `openSidebar` | `() => void` | Open the sidebar |
| `closeSidebar` | `() => void` | Close the sidebar |

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
