Accordion
=========

Accordion is a React component to display collapsible content panels.

## Usage

At a minimum, you must provide a `title` for your Accordion, and a child or set of children to be shown in the expanded panel.

```jsx
import Accordion from 'components/accordion';

export default function MyComponent() {
	return (
		<Accordion title="Section One">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit.
		</Accordion>
	);	
}
```

## Props

The following props are available to customize the accordion:

- `isExpanded`: Boolean indicating whether the panel is expanded or not. If the prop is changed, the component will toggle the state accordingly. This will work independently of clicking the accordion title to expand/collapse the element.
- `onToggle`: Function handler to invoke when the user toggles the accordion. The function will be passed a boolean indicating the expanded state after the toggle.
- `title`: Main heading shown in the always-visible toggle button
- `subtitle`: Subheading shown in the always-visible toggle button
- `icon`: React element to be shown as an icon adjacent to the headings in the always-visible toggle button.
- `status`: Optional object describing a status to be shown in accordion toggle, of shape:
  - `type`: `"info"`, `"warning"`, `"error"`
  - `text`: `string` for tooltip
  - `url`: `string` for click navigation
  - `position`: `string`, refer to [`<Tooltip />` documentation](../tooltip)
  - `onClick`: `function` callback on status click
