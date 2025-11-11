# Dashboard Command Palette

A command palette implementation for the dashboard, using WordPress's `@wordpress/commands` package and TanStack Router for navigation.

## Architecture

The command palette integrates with both WordPress Commands API and TanStack Router:

- Uses WordPress Commands for the UI, keyboard shortcuts, and command registration
- Uses TanStack Router for navigation commands
- Must be placed within the router context for navigation to work properly

## Placement Requirements

The command palette component **must** be placed within the Router context:

```jsx
// In root/index.tsx
import CommandPalette from '../command-palette';

function Root() {
  return (
    <div className="dashboard-root__layout">
      <Header />
      <main>
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  );
}
```

> **Important**: The command palette must be a child of a component within the TanStack Router context (like Root). Placing it as a sibling to RouterProvider will break navigation functionality.

## Opening the Command Palette

The command palette opens automatically with Cmd+K / Ctrl+K, or programmatically:

```jsx
import { useOpenCommandPalette } from '../command-palette/utils';

function YourComponent() {
	const openCommandPalette = useOpenCommandPalette();
  return (
    <button onClick={openCommandPalette}>
      Open Command Palette
    </button>
  );
}
```

## Implementation Details

This command palette:

1. **Uses WordPress Commands API**: Leverages the WordPress commands system for UI and keyboard shortcuts
2. **Integrates with TanStack Router**: Routes defined in commands.tsx use absolute paths (/path) for consistent navigation
3. **Auto-registers Navigation Commands**: Registers dashboard navigation commands on component mount
4. **Self-cleans on Unmount**: Unregisters all dashboard commands when the component unmounts

## Context-Aware Commands

Navigation commands can be filtered based on feature flags from the app context:

```typescript
export const navigationCommands: Command[] = [
  {
    name: 'dashboard-go-to-sites',
    label: __( 'Go to Sites' ),
    searchLabel: __( 'Navigate to Sites dashboard' ),
    path: '/sites',  // Note the leading slash for absolute paths
    icon: home,
    feature: 'sites', // Only show if 'sites' feature is enabled in the app context
  },
  // ... other commands
];
```

The command palette will only register commands for features that are enabled in the current dashboard configuration. This allows different dashboards (e.g., `/v2` vs `/v2-a4a`) to show different commands without code duplication.

## Adding Custom Commands

Custom commands can be added from any component:

```jsx
import { useRouter } from '@tanstack/react-router';
import { store as commandsStore } from '@wordpress/commands';
import { dispatch } from '@wordpress/data';

function YourComponent() {
  const router = useRouter();

  useEffect(() => {
    const { registerCommand } = dispatch(commandsStore);

    registerCommand({
      name: 'your-command-name',
      label: 'Your Command Label',
      callback: ({ close }) => {
        // First close the palette
        close();
        // Then perform any action, like navigation
        router.navigate({ to: '/your-path' });
      },
      icon: yourIcon,
    });

    return () => {
      const { unregisterCommand } = dispatch(commandsStore);
      unregisterCommand('your-command-name');
    };
  }, [router]);

  return <div>Your component content</div>;
}
```
