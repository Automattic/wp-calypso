# Main (jsx)

Component used to declare the main area of any given section —- it's the main wrapper that gets rendered first inside `#primary`.

## How to use

```jsx
import Main from 'calypso/components/main';

function render() {
	return <Main className="your-component">Your section content...</Main>;
}
```

## Props

- `className`: Add your own CSS class to the wrapper.
- `wideLayout`: Use wide layout (larger `max-width`) for the section.
