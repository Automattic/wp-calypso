# 🛠️ useSidebarManager

`useSidebarManager` is a flexible React hook for toggling between a sidebar chat and a floating chat experience. It uses [React Portal](https://react.dev/reference/react-dom/createPortal) under the hood and provides all the state, methods, and event callbacks needed to build a responsive AI chat layout that adapts to different user contexts.

## Usage

### React Example

Here's how to use the `useSidebarManager` hook in your React app:

```jsx
import useSidebarManager from '@hooks/use-sidebar-manager';

function App() {
	const { isDocked, isDesktop, dock, undock, openSidebar, closeSidebar, maybeCreateSidebarPortal } =
		useSidebarManager( '.sidebar-container', {
			defaultOpen: true,
			onDock: () => console.log( 'Docked!' ),
			onUndock: () => console.log( 'Undocked!' ),
		} );

	return maybeCreateSidebarPortal(
		<AgentUI.Container
			variant={ isDocked ? 'embedded' : 'floating' }
			// Other props...
		>
			<AgentUI.ConversationView>
				<ChatHeader
					isChatDocked={ isDocked }
					onClose={ isDocked ? closeSidebar : closeFloatingChat }
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
<div class="big-sky-sidebar-container big-sky-sidebar-container--sidebar-open">
	<div><!-- Main section (e.g., the editor) --></div>
	<div class="big-sky-sidebar"><!-- Sidebar section --></div>
</div>
```

You can reuse [the existing SCSS mixins](../../style.scss) to achieve the sidebar layout and transitions. If these don’t meet your needs, feel free to write your own styles based on the provided class names to match your page’s requirements.

**SCSS Example:**

```scss
@mixin sidebar-base( $main-container-selector ) {
	// Base sidebar styles
}

@mixin sidebar-open-base( $main-container-selector ) {
	// Styles when sidebar is open
}

.big-sky-sidebar-container {
	@include sidebar-base( '.the-main-container-selector' );

	&.big-sky-sidebar-container--sidebar-open {
		@include sidebar-open-base( '.the-main-container-selector' );
		@include editor-save-panel-open();
	}
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

- **`onDock`** (`function`, default: `() => {}`) - Callback fired when the sidebar element is added to the DOM.

- **`onUndock`** (`function`, default: `() => {}`) - Callback fired when the sidebar element is removed from the DOM.

### Return Value

The hook returns an object with the following properties:

- **`isDocked`** (`boolean`) - `true` when the sidebar is actually added to the DOM. This means the viewport is desktop-sized, docked mode is enabled, and the sidebar element exists.

- **`isDesktop`** (`boolean`) - `true` when the viewport matches the desktop media query.

- **`dock`** (`() => void`) - Switches to sidebar mode. When on desktop, this adds the sidebar to the DOM and automatically opens it.

- **`undock`** (`() => void`) - Switches to floating mode, which removes the sidebar from the DOM.

- **`openSidebar`** (`() => void`) - Opens the sidebar.

- **`closeSidebar`** (`() => void`) - Closes the sidebar.

- **`maybeCreateSidebarPortal`** (`(children: React.ReactNode) => React.ReactNode | React.ReactPortal`) - When docked, wraps children in a React Portal rendered inside the sidebar element and adds a FAB to reopen the sidebar. When undocked, returns children unchanged.
