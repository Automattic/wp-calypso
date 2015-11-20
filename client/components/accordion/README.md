Accordion
=========

Accordion is a React component to display collapsible content panels.

## Usage

At a minimum, you must provide a `title` for your Accordion, and a child or set of children to be shown in the panel.

```jsx
var Accordion = require( 'components/accordion' );

module.exports = React.createClass( {
	render: function() {
		return (
			<Accordion title="Section One">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris fermentum eget libero at pretium. Morbi hendrerit arcu mauris, laoreet dapibus est maximus nec. Sed volutpat, lorem semper porta efficitur, dui augue tempor ante, eget faucibus quam erat vitae velit.
			</Accordion>
		);
	}
} );
```

## Props

The following props are available to customize the accordion:

- `initialExpanded`: Boolean indicating whether the panel should default to expanded with the content visible
- `onToggle`: Function handler to invoke when the user toggles the accordion. The function will be passed a boolean indicating the expanded state after the toggle.
- `title`: Main heading shown in the always-visible toggle button
- `subtitle`: Subheading shown in the always-visible toggle button
- `icon`: String or React element to be shown as an icon adjacent to the headings in the always-visible toggle button. A string will be assumed to be used as the Noticon class suffix for the icon element.
