Performance Monitoring
======

`perfmon` records how much time one or more loading indicators spend on the screen (currently timings are only sent to Google Analytics, but the goal is to get them into statsd or Kibana pronto). This includes those flashing grey divs, and the "pulsing dot", but could be extended to any component.

Rather than hooking into React, we monitor the DOM itself for anything that looks like a placeholder (being careful not to do anything that would noticeably hurt performance), figure out whether it's visible on the screen, and if so we record how long it was there for.

How it works right now:

- A MutationObserver is created which monitors DOM childList and class attribute changes within div#wpcom.
- It matches classes on these altered nodes (and their children) against a very rudimentary list of strings (anything containing 'placeholder' or 'pulsing-dot is-active'). Any nodes that match are recorded as "activePlaceholders".
- It checks to see if any activePlaceholders are in the viewport. The event timing is the duration between the first placeholder appearing in the viewport and the last one disappearing.
- Placeholders can also be scrolled into view - it monitors for 'scroll' events with useCapture = true (debounced to 200ms) so that we can re-check if any known placeholders have now appeared.
- It hooks into the `page()` system in order to clear pending events when the user navigates (or, at least, when that navigation is done via the `page` library rather than replaceState/pushState)

You can enable this in development by running `ENABLE_FEATURES=perfmon yarn start`. You may also want to enable the `google-analytics` feature in your config file (or by URL, &flags=google-analytics) if you want to observe the events being sent to Google Analytics.

You can see how many active placeholders (visible and non visible) there detected during each check by running this in your console:

```js
localStorage.setItem('debug', 'calypso:perfmon')
```

and then reloading the browser.

Note that while the timer is started and stopped on every navigation, the
observer is only enabled on pages where it's explicitly initiated (such as
the post editor). In all other pages, the timer won't stop when the placeholders
are removed.

To enable monitoring for a page, import and run `recordPlaceholdersTiming` as
part of its load:

```js
import { recordPlaceholdersTiming } from 'lib/perfmon';

recordPlaceholdersTiming();
```
