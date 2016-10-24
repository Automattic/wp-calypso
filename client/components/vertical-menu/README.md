# Vertical Menu

This component provides a vertically-oriented list of items for typical use in selecting between different views in another part of the visible screen.

It is designed to take a list of React components using the `vertical-menu__items` CSS class. Of course, any special and standard type of list item should be implemented until `items/` as its own component.

The following predefined item types exist:

 - `<SocialItem />` - provides an icon and label for one of many social platforms.

## Usage

```js
import VerticalMenu from 'components/vertical-menu';
import { SocialItem } from 'components/vertical-menu/items';

const announceIt = service =>
	console.log( `Clicked on ${ service }` );

<VerticalMenu onClick={ announceIt }>
	<SocialItem service="google" />
	<SocialItem service="facebook" />
	<SocialItem service="twitter" />
</VerticalMenu>
```

## Props

 - **onClick** - Function - click handler. Transparently passes data from list items into handler.

### SocialItem

 - **onClick** - Function - passes string name of corresponding service

 - **service** - String - which social media service to display. Must be one of the following.
  - `"google"`
  - `"facebook"`
  - `"wordpress"`
  - `"linkedin"`
  - `"twitter"`
