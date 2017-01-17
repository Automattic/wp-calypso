Routing
=======

Let’s start with an informal definition of a section: A _section_ is usually a subdirectory of `client/my-sites`, `client/me`, or `client/reader` (which in contrast we call _(section) groups_). Most of the sidebar’s menu items link to individual sections; and there's usually a different sidebar for each group.

Now if you’ve worked in a given Calypso section before, you’ve probably encountered a piece of code inside your section’s `index.js[x]` that reads like this:

```js
import page from 'page';

import { siteSelection, navigation, sites } from 'my-sites/controller';
import { menus } from './controller';

export default function() {
	page( '/menus/:site_id', siteSelection, navigation, menus );
	page( '/menus', siteSelection, sites );
}
```

(That's basically [client/my-sites/menus/index.js](https://github.com/Automattic/wp-calypso/blob/master/client/my-sites/menus/index.js), by the way.)

## Route definitions

So what we're doing here is export a default function that holds our route definitions, using the [`page.js`](https://visionmedia.github.io/page.js/) client-side router.
This pattern is the same for all Calypso sections. If you're unfamiliar with `page.js`, each of these `page` functions associate a given route (e.g. `/menus/:site_id`) with a number of functions that will be invoked when a user hits that route.

Colon-prefixed route parts (such as `:site_id` here) are called route parameters. More on them in a bit.

## Middleware

Each of the functions in a route definition is called a _middleware_, but in Calypso parlance, we like to refer to them as _controllers_, too.
Each middleware takes up to two arguments, `context` and `next`. `next` is a function that if called will just invoke the next middleware in the chain, while context is a JavaScript object whose attributes you can read and write and use to communicate information from one middleware to the next. Route params are found in `context.params` (e.g. `context.params.site_id`). The last middleware in the chain -- `menus` and `sites` in our example -- usually doesn't call `next`, since, well, it's the last middleware we're calling.

So what does each middleware do? Unsurprisingly, the last middleware is usually section-specific; and most often, it will render the section's primary content area (actually found in a `<div />` with `id="primary"`). The other middlewares found in this example are more generic (but specific to the `my-sites` group):

* `navigation` renders the section group's sidebar to the `#secondary` `<div />`.
* `siteSelection` parses the current route, looking out for something that looks like a URL or numeric site ID, and sets the currently selected site based on this information. You can then find it by using the `getSelectedSiteId` selector found in `state/sites/selectors`.
* `sites` renders a site selector menu to the `#primary` `div` for the user to select a site, and will then redirect to that site.
