# Navigation Blocker

Navigation Blocker provides a simple way to prevent route changes when certain conditions are met (for example, when a form has unsaved changes).

It is built on top of the `useBlocker` hook from `@tanstack/react-router`.

## Components

### `NavigationBlocker`

Registers a navigation blocker when `shouldBlock` is `true`.

- Accepts an optional message that can be shown when navigation is blocked.
- Automatically unregisters when the component unmounts or when `shouldBlock` becomes `false`.

### `NavigationBlockerRegistry`

Central registry that checks whether any `NavigationBlocker` is currently active.

- If at least one blocker is registered, it uses the `useBlocker` hook from `@tanstack/react-router` to prevent navigation.
- Should be mounted once in your application (typically near the root). Alternatively, you may mount it at the page level if scoping is required

## Usage

### 1. Add the registry

Mount `NavigationBlockerRegistry` at a high level in your app (for example, in your root layout or page component).

```jsx
// root.jsx
import { NavigationBlockerRegistry } from 'client/dashboard/components/navigation-blocker';

const Root = () => {
	return (
		<>
			{ /* other app components */ }
			<NavigationBlockerRegistry />
		</>
	);
};

export default Root;
```

### 2. Register a blocker where needed

Use `NavigationBlocker` in any component that needs to prevent navigation (e.g. a form with unsaved changes).

```jsx
// form.jsx
import { NavigationBlocker } from 'client/dashboard/components/navigation-blocker';

const Form = () => {
	const isDirty = true;

	return (
		<>
			{ /* DataForm */ }
			<NavigationBlocker shouldBlock={ isDirty } />
		</>
	);
};

export default Form;
```
