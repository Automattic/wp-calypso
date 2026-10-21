# 🎛️ useAgentLayoutManager

`useAgentLayoutManager` is a flexible React hook for toggling between a sidebar chat and a floating chat experience. It uses [React Portal](https://react.dev/reference/react-dom/createPortal) under the hood and provides all the state, methods, and event callbacks needed to build a responsive AI chat layout that adapts to different user contexts.

**Key behavior**: On desktop (≥1200px), the chat can be docked as a sidebar or floating. On mobile/tablet, the chat is always floating.

On Gutenberg editor screens (`post-php`, `post-new-php`, `site-editor-php`), docking also requires fullscreen mode (`body.is-fullscreen-mode`) — without it, wp-admin's chrome leaves too little room for the editor alongside the chat. The gate is re-evaluated whenever the `body` class list changes, so toggling fullscreen at runtime switches the chat between docked and floating.

## Usage

### React Example

The hook is internal to this package. A component in `components/` uses it like this:

```jsx
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import useAgentLayoutManager from '../hooks/use-agent-layout-manager';
import ChatView from './chat-view'; // Your chat UI.

function Chat( { onClose } ) {
	const { isDocked, canDock, dock, undock, closeSidebar, createAgentPortal } =
		useAgentLayoutManager( {
			sidebarContainer: '.sidebar-container',
			defaultOpen: true,
		} );

	return createAgentPortal(
		<>
			{ canDock && (
				<Button onClick={ isDocked ? undock : dock }>
					{ isDocked ? __( 'Undock', __i18n_text_domain__ ) : __( 'Dock', __i18n_text_domain__ ) }
				</Button>
			) }
			<Button onClick={ isDocked ? closeSidebar : onClose }>
				{ __( 'Close', __i18n_text_domain__ ) }
			</Button>
			<ChatView variant={ isDocked ? 'embedded' : 'floating' } />
		</>
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
- `is-split-screen` is toggled on the container when the `isSplitScreen` option is `true`, letting consumer SCSS opt into a wider docked layout

Jetpack's pre-paint docking gate (`projects/packages/agents-manager/src/js/sidebar-docking-gate.ts`) mirrors the docking conditions and these class names, so a change to either needs a matching Jetpack change.

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

- **`isReady`** (`boolean`, default: `true`) - Controls whether the layout manager is active. When `false`, all functions (`dock`, `undock`, `openSidebar`, `closeSidebar`) become no-ops and the portal setup is skipped. Turning it back to `false` later doesn't remove a portal that already exists. Useful for async persisted states loaded, allowing the hook to wait until state is ready before activating the layout manager.

- **`defaultDocked`** (`boolean`, default: `true`) - Sets the initial docked state. If `true`, the chat starts docked (on desktop only). If `false`, it starts in floating (undocked) mode. After initialization, the state can be changed via `dock()` and `undock()` methods.

- **`defaultOpen`** (`boolean`, default: `false`) - Whether the sidebar opens when the docked layout first renders and each time it is re-entered (`dock()`, a wider viewport, entering fullscreen). The initial state is also open when the container already has `agents-manager-sidebar-container--sidebar-open`.

- **`desktopMediaQuery`** (`string`, default: `'(min-width: 1200px)'`) - Media query string to determine desktop layout.

- **`onOpenSidebar`** (`() => void`, default: `() => {}`) - Callback fired when `openSidebar()` runs, which the FAB and `dock()` call. Not fired when the sidebar starts open, or when `defaultOpen` reopens it as the docked layout comes back.

- **`onCloseSidebar`** (`() => void`, default: `() => {}`) - Callback fired when `closeSidebar()` closes the sidebar. Not fired when undocking or losing `canDock` hides it (`onUndock` fires instead).

- **`onDock`** (`() => void`, default: `() => {}`) - Callback fired each time the docked layout is entered after the chat element is created: `dock()`, a wider viewport or entering fullscreen.

- **`onUndock`** (`() => void`, default: `() => {}`) - Callback fired when the chat switches from docked to floating: `undock()`, a narrower viewport or leaving fullscreen. Also fires when the docked preference changes while `canDock` is `false`, but not when the chat element is created.

- **`isSplitScreen`** (`boolean`, default: `false`) - When `true`, the hook toggles an `is-split-screen` modifier class on the sidebar container so consumer SCSS can opt into a wider docked layout (e.g. `--am-sidebar-width: 50vw`).

### Return Value

The hook returns an object with the following properties:

- **`isDocked`** (`boolean`) - `true` when the chat is in docked (sidebar) mode. Requires `canDock` to be `true` AND docked mode to be enabled (via `defaultDocked` or `dock()`).

- **`isSidebarOpen`** (`boolean`) - `true` when the chat is docked and the sidebar is open.

- **`canDock`** (`boolean`) - `true` when docking is possible. Requires a desktop viewport (matches `desktopMediaQuery`) and — on Gutenberg editor screens (`post-php`, `post-new-php`, `site-editor-php`) — fullscreen mode (`body.is-fullscreen-mode`). Updates dynamically as these conditions change. Use this to show or hide dock/undock UI controls.

- **`dock`** (`() => void`) - Sets the docked preference. When `canDock` is `true`, the docked layout renders and the sidebar opens. No-op when `isReady` is `false` or `sidebarContainer` is not found.

- **`undock`** (`() => void`) - Switches to floating mode. This disables the docked layout. No-op when `isReady` is `false` or `sidebarContainer` is not found.

- **`openSidebar`** (`() => void`) - Opens the sidebar and fires `onOpenSidebar`. Works whenever `canDock` is `true`, even while undocked; the open state shows once docked. No-op when `isReady` is `false` or `sidebarContainer` is not found.

- **`closeSidebar`** (`() => void`) - Closes the sidebar and fires `onCloseSidebar`. Works whenever `canDock` is `true`. No-op when `isReady` is `false` or `sidebarContainer` is not found.

- **`portalNode`** (`HTMLElement | null`) - The node the chat renders into, e.g. to pass to `useRaiseOnFocus`. `null` until it is created.

- **`createAgentPortal`** (`(children: React.ReactNode) => React.ReactNode | React.ReactPortal`) - Creates a React Portal for the chat UI. The portal renders into the `.agents-manager-chat` element the hook appends to `sidebarContainer`. When docked, it adds a FAB (floating action button) to reopen the sidebar when closed; when undocked, it renders the children without the FAB. Returns `null` until that element exists. It's created only while `isReady` is `true` and the container exists, and it stays until the container changes or the hook unmounts. The element is created hidden; only the package stylesheet (`components/agent-dock/chat-ui.scss`) reveals it, so a page without the stylesheet shows no chat and gets an `[AgentsManager]` console error. Portal children can call `useResponsiveUndock()` from `./responsive-undock-context` to read `isResponsiveUndocked` (the chat is floating only because the viewport is below `desktopMediaQuery` while the docked preference is on) and `undockCount` (bumped on each responsive undock — `useFloatingPanelProps` uses it as the floating panel's `layoutCommand` id).
