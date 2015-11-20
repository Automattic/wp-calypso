Layout Focus
============

This module keeps track of the UI focus state. The focus is represented by `[ 'content', 'sidebar', 'sites' ]`. The app sets the focus based on various factors, including how the user interacts with the interface. We use this data to toggle between showing the sites list and the sidebar in My Sites sections, or to show the content or the sidebar for mobile. It's also used on `page()` navigations to declarative state what piece of the interface should be the focus at any given time.

`layout-focus` also keeps track of the previous focus in case it's needed to figure out transitions or what "back" may mean at any given point in time. The module triggers a `change` event so it can be listened to via `observe`.

#### How to use:

```js
var layoutFocus = require( 'lib/layout-focus' );

// Focus on 'content'
layoutFocus.set( 'content' );

// Get current focus
layoutFocus.getCurrent();

// Get previous focus
layoutFocus.getPrevious();
```
