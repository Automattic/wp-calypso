Routing
=======

Let’s start with an informal definition of a section: A _section_ is usually a subdirectory of `client/my-sites`, `client/me`, or `client/reader` (which in contrast we call _(section) groups_). Most of the sidebar’s menu items link to individual sections; and there's usually a different sidebar for each group.

Now if you’ve worked in a given Calypso section before, you’ve probably encountered a piece of code inside your section’s `index.js[x]` that reads like this:

```js
import page from 'page';

import { makeLayout, render as clientRender } from 'controller';
import { siteSelection, navigation, sites } from 'my-sites/controller';
import menus from './controller';

export default function() {
	page(
		'/menus/:site_id',
		siteSelection,
		navigation,
		menus, // Create Menus component in `context.primary`
		makeLayout,
		clientRender
	);
	page(
		'/menus',
		sites,
		makeLayout,
		clientRender
	);
}
```

## Route definitions

So what we're doing here is export a default function that holds our route definitions, using the [`page.js`](https://visionmedia.github.io/page.js/) client-side router.
This pattern is the same for all Calypso sections. If you're unfamiliar with `page.js`, each of these `page` functions associate a given route (e.g. `/menus/:site_id`) with a number of functions that will be invoked when a user hits that route.

Colon-prefixed route parts (such as `:site_id` here) are called route parameters. More on them in a bit.

## Middleware

Each of the functions in a route definition is called a _middleware_, but in Calypso parlance, we like to refer to them as _controllers_, too.
Each middleware takes up to two arguments, `context` and `next`. `next` is a function that if called will just invoke the next middleware in the chain, while context is a JavaScript object whose attributes you can read and write and use to communicate information from one middleware to the next. Route params are found in `context.params` (e.g. `context.params.site_id`). The last middleware in the chain -- `menus` and `sites` in our example -- usually doesn't call `next`, since, well, it's the last middleware we're calling.

So what does each middleware do?

The last middleware before `makeLayout` is usually section-specific; and most often, it will place the section's primary view in `context.primary`. Other middleware found in this example is more generic.

Middleware specific to the my-sites group:

* `navigation` generates the section group's sidebar in `context.secondary`
* `siteSelection` parses the current route, looking out for something that looks like a URL or numeric site ID, and sets the currently selected site based on this information. You can then find it by using the `getSelectedSiteId` selector found in `state/sites/selectors`.
* `sites` renders a site selector menu for the user to select a site, and will then append that site's slug to current route.

Content-rendering middleware:

* `makeLayout` takes `context.primary` (view's primary content area) and `context.secondary` (a sidebar) and generates a single [`Layout`](../client/layout/README.md) component containing those two.
* `clientRender` takes the `Layout` component and renders it to a server-generated `<div />` called `#wpcom`.

This all happens in the client but `Layout` can be also server-side rendered (SSR). You can read more about this in [server-side rendering](server-side-rendering.md) and [Isomorphic Routing](isomorphic-routing.md) documentation.

This wraps up the more introductory part; if you're interested in more details, keep on reading.

## Section Definitions

More formally, sections are defined in [`client/sections.js`](../client/sections.js). While that file's format should be intuitive enough to understand, we use quite a bit of magic to turn it into actual routing and code-splitting code. Most of it is documented in [`client/server/bundler/README.md`](../client/server/bundler/README.md).

## Site-specific URLs

When a URL in Calypso is a view that relates to a site, the `site_slug` filter should usually be the last URL fragment. This means that when you remove it you should get all sites views for the same section. For example:

`/posts/drafts/:site.` - If you remove the “site” you should get a view for all sites. Use that principle to determine where the site fragment should be.

There are some exceptions to this; if the filter is an id, which is specific to a site—in that case, the site specific resources should go after the site fragment. For example:

`/comment/{ siteFragment }/{ commentId }`

`/post/{ siteFragment }/{ postId }`


Our code supports last, second to last, and for some exceptions, using a :site parameter.
