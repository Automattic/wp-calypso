# detect-history-navigation

This module determines when a page has been rendered via the history event (back or forward buttons, or via the history methods) versus being a newly navigated page (e.g., via clicking a link to a page).

This can be used alongside the [page.js module](https://www.npmjs.com/package/page) by calling the `start()` method of this module _prior_ to the `start()` method of `page.js`.

```js
import page from 'page';
import detectHistoryNavigation from 'detect-history-navigation';

detectHistoryNavigation.start();
page.start();
```

Then controllers and components can call `detectHistoryNavigation.loadedViaHistory()` which returns a boolean determining whether the current route is being loaded from a history event or is a fresh pageload.

Components that are mounted into the initial view of a page that is loaded by history can detect this in `componentWillMount`, `componentDidMount`, and the initial run of their `render` method. After the initial render `loadedViaHistory()` will return false.
