# 🎛️ useAgentLayoutManager

`useAgentLayoutManager` is a flexible React hook for toggling between a sidebar chat and a floating chat experience. It uses [React Portal](https://react.dev/reference/react-dom/createPortal) under the hood and provides all the state, methods, and event callbacks needed to build a responsive AI chat layout that adapts to different user contexts.

**Key behavior**: On desktop (≥1200px), the chat can be docked as a sidebar or floating. On mobile/tablet, the chat is always floating.

In order to prevent issues with the WP admin sidebar the hook will also use floating mode if the page height is less than that of the sidebar.

## Usage

### React Example

Here's how to use the `useAgentLayoutManager` hook in your React app:

```jsx
import { AgentUI } from '@agents-manager/components';
import useAgentLayoutManager from '@hooks/use-agent-layout-manager';
import { ChatHeader } from './components/chat-header';

function App() {
	const { isDocked, isDesktop, dock, undock, openSidebar, closeSidebar, createAgentPortal } =
		useAgentLayoutManager( {
			sidebarContainer: '.sidebar-container',
			defaultOpen: true,
			onDock: () => console.log( 'Docked!' ),
			onUndock: () => console.log( 'Undocked!' ),
		} );

	const handleClose = () => {
		// Handle closing the floating chat (e.g., hide it)
	};

	return createAgentPortal(
		<AgentUI.Container variant={ isDocked ? 'embedded' : 'floating' }>
			<AgentUI.ConversationView>
				<ChatHeader
					isChatDocked={ isDocked }
					onClose={ isDocked ? closeSidebar : handleClose }
					onDock={ dock }
					onUndock={ undock }
					showDockOption={ isDesktop }
				/>
				<AgentUI.Messages />
				<AgentUI.Footer>
					<AgentUI.Suggestions />
					<AgentUI.Input />
				</AgentUI.Footer>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
```

### CSS Integration

The hook manages the sidebar DOM structure and CSS classes. Customize the styles for each page to fit your layout needs.

**HTML Structure:**

```html
<div class="agents-manager-sidebar-container agents-manager-sidebar-container--sidebar-open">
	<div><!-- Main section (e.g., the editor) --></div>
	<div class="agents-manager-chat agents-manager-chat--docked">
		<!-- The portal renders your chat UI and FAB button here -->
		<!-- Your Chat Component (via createAgentPortal) -->
		<button class="agents-manager-sidebar-fab">Open Chat</button>
	</div>
</div>
```

The hook automatically manages these CSS classes based on the chat state:
- `agents-manager-sidebar-container` is added when docked on desktop
- `agents-manager-sidebar-container--sidebar-open` is added when the sidebar is open
- `agents-manager-chat--docked` or `agents-manager-chat--undocked` based on mode

**SCSS Example:**

```scss
.agents-manager-sidebar-container {
	// Base container styles - layout with sidebar space

	&.agents-manager-sidebar-container--sidebar-open {
		// Styles when sidebar is open (e.g., visible sidebar panel)

		// Hide FAB when sidebar is open
		.agents-manager-sidebar-fab {
			display: none;
		}
	}
}

.agents-manager-chat {
	&.agents-manager-chat--docked {
		// Styles for docked (sidebar) mode
	}

	&.agents-manager-chat--undocked {
		// Styles for undocked (floating) mode
	}
}

.agents-manager-sidebar-fab {
	// Styles for the "Open Chat" floating action button
	// Visible when docked and sidebar is closed
	// Hidden when sidebar is open (via parent class)
}
```

## API

### Parameters

The hook accepts a single options object. All properties are optional.

#### `options` (`object`, optional)

- **`sidebarContainer`** (`HTMLElement` | `string`, default: `'body'`) - The container element where the sidebar will be rendered. This should be the parent of both the main section (e.g., the editor) and the sidebar itself. Can be either a DOM element or a CSS selector string.

- **`isReady`** (`boolean`, default: `true`) - Controls whether the layout manager is active. When `false`, all functions (`dock`, `undock`, `openSidebar`, `closeSidebar`) become no-ops and the portal setup is skipped. Useful for async persisted states loaded, allowing the hook to wait until state is ready before activating the layout manager.

- **`defaultDocked`** (`boolean`, default: `true`) - Sets the initial docked state. If `true`, the chat starts docked (on desktop only). If `false`, it starts in floating (undocked) mode. After initialization, the state can be changed via `dock()` and `undock()` methods.

- **`defaultOpen`** (`boolean`, default: `false`) - Sets whether the sidebar is initially open. Only applies on first mount when the chat is docked on desktop (i.e., when `defaultDocked` is `true` and viewport matches `desktopMediaQuery`).

- **`desktopMediaQuery`** (`string`, default: `'(min-width: 1200px)'`) - Media query string to determine desktop layout.

- **`onOpenSidebar`** (`() => void`, default: `() => {}`) - Callback fired when the sidebar is opened.

- **`onCloseSidebar`** (`() => void`, default: `() => {}`) - Callback fired when the sidebar is closed.

- **`onDock`** (`() => void`, default: `() => {}`) - Callback fired when the chat switches to docked (sidebar) mode.

- **`onUndock`** (`() => void`, default: `() => {}`) - Callback fired when the chat switches to floating (undocked) mode.

### Return Value

The hook returns an object with the following properties:

- **`isDocked`** (`boolean`) - `true` when the chat is in docked (sidebar) mode. This requires both: the viewport is desktop-sized (matches `desktopMediaQuery`) AND docked mode is enabled. On mobile/tablet, this is always `false`.

- **`isDesktop`** (`boolean`) - `true` when the viewport matches the desktop media query.

- **`dock`** (`() => void`) - Switches to sidebar mode. When on desktop, this enables the docked layout and automatically opens the sidebar. No-op when `isReady` is `false` or `sidebarContainer` is not found.

- **`undock`** (`() => void`) - Switches to floating mode. This disables the docked layout. No-op when `isReady` is `false` or `sidebarContainer` is not found.

- **`openSidebar`** (`() => void`) - Opens the sidebar. Only works when docked on desktop. No-op when `isReady` is `false` or `sidebarContainer` is not found.

- **`closeSidebar`** (`() => void`) - Closes the sidebar. Only works when docked on desktop. No-op when `isReady` is `false` or `sidebarContainer` is not found.

- **`createAgentPortal`** (`(children: React.ReactNode) => React.ReactNode | React.ReactPortal`) - Creates a React Portal for the chat UI. When docked, wraps children in a portal rendered inside the sidebar element and adds a FAB (floating action button) to reopen the sidebar when closed. When undocked, returns children in a portal without the FAB. Returns `null` if the portal element is not yet created (first render only).
