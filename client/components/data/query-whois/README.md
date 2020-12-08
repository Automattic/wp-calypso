# Query Whois

`<QueryWhois />` is a React component used to perform a WHOIS lookup via WP.com server-side. The queried domain must be owned by the user.

## Usage

Render the component. The component does not accept any children, nor does it render any of its own.

```jsx
function MyComponent() {
	const domain = 'example.com';
	return <QueryWhois domain={ domain } />;
}
```

## Props

This component accepts one prop:

`domain`
