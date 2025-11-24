# 🛠️ useChatLayoutManager

`useChatLayoutManager` is a flexible React hook for toggling between a sidebar chat and a floating chat experience. It uses [React Portal](https://react.dev/reference/react-dom/createPortal) under the hood and provides all the state, methods, and event callbacks needed to build a responsive AI chat layout that adapts to different user contexts.

## Usage

### React Example

Here's how to use the `useChatLayoutManager` hook in your React app:

```jsx
import useChatLayoutManager from '@hooks/use-chat-layout-manager';

function App() {
	const { isDocked, isDesktop, dock, undock, openSidebar, closeSidebar, createChatPortal } =
		useChatLayoutManager( '.sidebar-container', {
			defaultOpen: true,
			onDock: () => console.log( 'Docked!' ),
			onUndock: () => console.log( 'Undocked!' ),
		} );

	return createChatPortal(
		<AgentUI.Container
			variant={ isDocked ? 'embedded' : 'floating' }
			// Other props...
		>
			<AgentUI.ConversationView>
				<ChatHeader
					isChatDocked={ isDocked }
					onClose={ isDocked ? closeSidebar : () => {} /* Handle close */ }
					options={ [
						isDocked && undockMenuItem,
						! isDocked && isDesktop && dockMenuItem,
						// Other options...
					] }
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
		<!-- Chat portal rendered here -->
		<!-- Your Chat Component -->
		<button class="agents-manager-sidebar-fab">Open Chat</button>
	</div>
</div>
```

The hook automatically manages these CSS classes based on the chat state.

**SCSS Example:**

```scss
.agents-manager-sidebar-container {
	// Base container styles - layout with sidebar space

	&.agents-manager-sidebar-container--sidebar-open {
		// Styles when sidebar is open (e.g., visible sidebar panel)
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
	// Styles for the "Open Chat" floating action button (visible when docked but sidebar is closed)
}
```

## API

### Parameters

#### `sidebarContainer` (`HTMLElement` | `string`, **required**)

The container element where the sidebar will be rendered. This should be the parent of both the main section (e.g., the editor) and the sidebar itself. Can be either a DOM element or a CSS selector string.

#### `options` (`object`, optional)

Configuration options for the hook:

- **`defaultUndocked`** (`boolean`, default: `false`) - If `true`, the chat starts in floating (undocked) mode by default.

- **`defaultOpen`** (`boolean`, default: `false`) - If `true`, the sidebar is open by default when docked.

- **`desktopMediaQuery`** (`string`, default: `'(min-width: 1200px)'`) - Media query string to determine desktop layout.

- **`onOpenSidebar`** (`function`, default: `() => {}`) - Callback fired when the sidebar is opened.

- **`onCloseSidebar`** (`function`, default: `() => {}`) - Callback fired when the sidebar is closed.

- **`onDock`** (`function`, default: `() => {}`) - Callback fired when the chat switches to docked (sidebar) mode.

- **`onUndock`** (`function`, default: `() => {}`) - Callback fired when the chat switches to floating (undocked) mode.

### Return Value

The hook returns an object with the following properties:

- **`isDocked`** (`boolean`) - `true` when the chat is in docked (sidebar) mode. This means the viewport is desktop-sized and docked mode is enabled.

- **`isDesktop`** (`boolean`) - `true` when the viewport matches the desktop media query.

- **`dock`** (`() => void`) - Switches to sidebar mode. When on desktop, this enables the docked layout and automatically opens the sidebar.

- **`undock`** (`() => void`) - Switches to floating mode. This disables the docked layout.

- **`openSidebar`** (`() => void`) - Opens the sidebar.

- **`closeSidebar`** (`() => void`) - Closes the sidebar.

- **`createChatPortal`** (`(children: React.ReactNode) => React.ReactNode | React.ReactPortal`) - Creates a React Portal for the chat UI. When docked, wraps children in a portal rendered inside the sidebar element and adds a FAB to reopen the sidebar. When undocked, returns children in a portal without the FAB. Returns `null` if the portal element is not yet created.
