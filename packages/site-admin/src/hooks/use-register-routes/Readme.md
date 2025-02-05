# `useRegisterRoutes`

Registers a set of routes in the `@automattic/site-admin` store using the `registerRoute` action.

## Usage

### Import
```tsx
import { useRegisterRoutes } from '@automattic/site-admin';
```

### Example
```tsx
import { useRegisterRoutes } from '@automattic/site-admin';

const homeRoutes = [
	{
		name: 'home',
		path: '/',
		areas: {
			content: <Home />,
			sidebar: <SidebarHome />,
		},
		widths: {},
	},
	{
		name: 'contact',
		path: '/contact-with-me',
		areas: {
			content: <Contact />,
			sidebar: <SidebarHome />,
		},
		widths: {},
	},
];

function App() {
    useRegisterRoutes( homeRoutes );

    return <div>App Content</div>;
}
```

## Types

### `Route`
```tsx
interface Route {
    name: string;
    path: string;
    areas: Record<string, JSX.Element>;
    widths: Record<string, number>;
}
```

## Parameters

### `routes`
- **Type:** `Route[]`
- **Default:** `[]`
- **Description:** A list of route objects to be registered.
