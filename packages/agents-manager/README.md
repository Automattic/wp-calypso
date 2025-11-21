# @automattic/agents-manager

AI agent dock and sidebar components with multi-context support for WordPress, Calypso, and generic environments.

## Features

- **ChatLayoutManager**: Flexible sidebar/dock component using React Portal
- **Multi-Context Support**: Works in WordPress (wp-admin, block-editor, site-editor), Calypso, and generic contexts
- **Adapter System**: Pluggable adapters for context management
- **Ability Registry**: Async/programmatic API for registering agent abilities
- **Session Management**: Persistent session IDs with configurable expiry
- **Chat State**: Persistent chat expand/collapse state

## Installation

```bash
yarn add @automattic/agents-manager
```

## Quick Start

### Basic Usage

```tsx
import { ChatLayoutManager, GenericContextAdapter } from '@automattic/agents-manager';

function MyApp() {
  return (
    <ChatLayoutManager
      sidebarContainer="body"
      defaultOpen
    >
      { ( { isDocked, isDesktop, openSidebar, closeSidebar } ) => (
        <div>
          <h2>Agent Chat</h2>
          <p>Docked: { isDocked ? 'Yes' : 'No' }</p>
          {/* Your agent UI here */}
        </div>
      ) }
    </ChatLayoutManager>
  );
}
```

### WordPress Context

```tsx
import {
  ChatLayoutManager,
  WordPressContextAdapter,
} from '@automattic/agents-manager';

const contextAdapter = new WordPressContextAdapter( 'wp-admin' );

// Use in your component
<ChatLayoutManager sidebarContainer="#wpwrap">
  { ( props ) => <YourAgentUI { ...props } /> }
</ChatLayoutManager>
```

### Calypso Context

```tsx
import {
  ChatLayoutManager,
  CalypsoContextAdapter,
} from '@automattic/agents-manager';

const contextAdapter = new CalypsoContextAdapter( 'calypso-help-center' );
```

## Hooks

### useChatState

Manages chat expand/collapse state with localStorage persistence.

```tsx
import { useChatState } from '@automattic/agents-manager';

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
import { useAgentSession } from '@automattic/agents-manager';

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
import { defaultAbilityRegistry } from '@automattic/agents-manager';

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
import { WordPressContextAdapter } from '@automattic/agents-manager';

const adapter = new WordPressContextAdapter( 'block-editor' );
const context = await adapter.getContext();
// { url, pathname, environment, additionalData }
```

## API Reference

### ChatLayoutManager Props

| Prop                 | Type                                 | Default                 | Description                  |
| -------------------- | ------------------------------------ | ----------------------- | ---------------------------- |
| `children`           | `(props: RenderProps) => ReactNode`  | required                | Render prop function         |
| `sidebarContainer`   | `string \| HTMLElement`              | required                | Target container for sidebar |
| `defaultUndocked`    | `boolean`                            | `false`                 | Start in floating mode       |
| `defaultOpen`        | `boolean`                            | `false`                 | Open sidebar by default      |
| `desktopMediaQuery`  | `string`                             | `'(min-width: 1200px)'` | Desktop breakpoint           |
| `classNamePrefix`    | `string`                             | `'agents-manager'`      | CSS class prefix             |
| `fabIcon`            | `ReactNode`                          | AI icon                 | FAB button icon              |
| `fabLabel`           | `string`                             | `'Open Chat'`           | FAB button label             |
| `onOpenSidebar`      | `() => void`                         | -                       | Callback when opened         |
| `onCloseSidebar`     | `() => void`                         | -                       | Callback when closed         |
| `onDock`             | `() => void`                         | -                       | Callback when docked         |
| `onUndock`           | `() => void`                         | -                       | Callback when undocked       |

### ChatLayoutManager Render Props

| Prop           | Type         | Description                 |
| -------------- | ------------ | --------------------------- |
| `isDocked`     | `boolean`    | Whether sidebar is docked   |
| `isDesktop`    | `boolean`    | Whether viewport is desktop |
| `dock`         | `() => void` | Dock the sidebar            |
| `undock`       | `() => void` | Undock to floating          |
| `openSidebar`  | `() => void` | Open the sidebar            |
| `closeSidebar` | `() => void` | Close the sidebar           |

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
