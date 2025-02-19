# WordPressLogo

WordPressLogo is a React component to display wordpress logo.

## Usage

```jsx
import { WordPressLogo } from '@automattic/components';

export default function MyComponent() {
	return <WordPressLogo />;
}
```

## Props

The following props can be passed to the WordPressLogo component:

| PROPERTY      | TYPE     | REQUIRED | DEFAULT            | DESCRIPTION                                     |
| ------------- | -------- | -------- | ------------------ | ----------------------------------------------- |
| **size**      | _number_ | no       | `72`               | The width and height of the spinner, in pixels. |
| **className** | _string_ | no       | `'wordpress-logo'` | The CSS class name applied to the SVG element.  |

Note that passing a class name through the `className` prop will override the default class,
rather than merging them together. We plan to fix this behavior.
