# DocsExample

This component is used to implement a skeleton for components examples which are generally showcased in the devdocs.

## How to use

```jsx
import DocsExample from 'calypso/devdocs/design/docs-example';

function render() {
	return (
		<DocsExample
			usageStats={ this.props.usageStats }
			toggleHandler={ this.toggleMyComponent }
			toggleText={ toggleText }
		>
			{ this.renderExamples() }
		</DocsExample>
	);
}
```

## Props

- `usageStats`: (object) An object containing the usage stats e.g. `{ count: 10 }`.
- `toggleHandler`: (func) A function to toggle the example state.
- `toggleText`: (string) Text for the toggle button.
