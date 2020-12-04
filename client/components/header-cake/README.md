# Back Button aka Header Cake

The "header cake" component should be used at the top of an item's detail page. It's purpose is to display a title and back link.

## Usage

```js
import HeaderCake from 'calypso/components/header-cake';

<HeaderCake onClick={ callback }>Item Details</HeaderCake>;
```

## Props

- `onClick` - Function to trigger when the back text is clicked
- `onTitleClick` - Function to trigger when the title is clicked
- `backText` - React Element or string to use in place of default "Back" text
- `backHref` - URL to specify where the back button should redirect
- `isCompact` - Optional variant of a more visually compact header cake
- `actionButton` - A React element to be used in place of the standard action button
- `actionText` - You can optionally add a button to the right side of the header, this is the text shown
- `actionHref` - You can optionally add a button to the right side of the header, this the link on that button
- `actionIcon` - You can optionally add a button to the right side of the header, this is the Gridicon used
- `actionOnClick` - You can optionally add a button to the right side of the header, this is called onClick of that button
- `alwaysShowActionText` - Force showing the right button text instead of hiding it on small screens
