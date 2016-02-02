Back Button aka Header Cake
===========================

The "header cake" component should be used at the top of an item's detail page. It's purpose is to display a title and back link.

## Usage

```js
	var HeaderCake = require( 'components/header-cake' );

	<HeaderCake onClick={ callback }>Item Details</HeaderCake>
```

## Props

* `onClick` - (**required**) Function to trigger when the back text is clicked
* `onTitleClick` - Function to trigger when the title is clicked
* `backText` - React Element or string to use in place of default "Back" text
* `isCompact` - Optional variant of a more visually compact header cake
