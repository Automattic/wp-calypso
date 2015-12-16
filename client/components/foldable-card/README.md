Foldable card
==============

This component is used to display a box that can be clicked to expand a hidden section with its contents.

#### How to use:

```js
var FoldableCard = require( 'components/foldable-card' );

render: function() {
	return (
		<div>
			 <FoldableCard
				header={ 'title' }
			 >
			 	{ content }
			 </FoldableCard>
		</div>
	);
}
```

#### Props

* `header`: a string, HTML or component to show in the default header view of the box

#### Children
* `content`: a string, HTML or component to show in the expandable section of the box when it's expanded

##### Optional props
* `actionButton`: a component to substitute the regular expand button
* `actionButtonExpanded`: a component to substitute the regular expand button when the card is expanded. If not provided, we use `actionButton`
* `icon`: a string to set the Gridicon slug for the regular expand button. Defaults to `chevron-down`. Only applies when the `actionButton` or `actionButtonExpanded` props are not set.
* `cardKey`: a unique identifier for the card that can be used to help track its state outside the component (for example, to record which cards are open).
* `compact`: a boolean indicating if the foldable card is compact
* `disabled`: boolean indicating if the component it's not interactive
* `expandedSummary`: string or component to show next to the action button when expanded
* `expanded`: boolean indicating if the component is expanded on initial render
* `onClick`: function to be executed in addition to the expand action when the header is clicked
* `onClose`: function to be executed in addition to the expand action when the card is closed
* `onOpen`: function to be executed in addition to the expand action when the card is opened
* `summary`: string or component to show next to the action button when closed
* `clickableHeader`: boolean indicating if the whole header can be clicked to open the card