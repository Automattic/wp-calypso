Merge Checklist
===============

This document aims to provide a list of things to check and test whenever you are working on a pull request — or when you are reviewing one — for Calypso.

* Run `yarn test` from the calypso root to make sure all tests pass.
* Test with multiple individual sites, and All My Sites. Does everything work as expected? Use the site switcher and directly via URL.
* Test scenarios where your feature intentionally doesn't work (e.g. not supported on Jetpack)
* Explicitly test with a Jetpack-powered site. Calypso features should all work with Jetpack sites unless they are strictly WordPress.com-only.
* Test different user privileges (admin, editor, author). How does your code behave?
* Your code should work well with an empty initial state. It's easy to overlook that data cached via [state persistence](https://github.com/Automattic/wp-calypso/blob/master/docs/our-approach-to-data.md#data-persistence--2754-) may not be present when a user logs in for the first time, clears their browser history, or visits with a different browser. Errors can occur if you've introduced code which operates on this data without checking for its existence.
  * Start a new session in private browsing mode, or run `localStorage.clear(); indexedDB.deleteDatabase( 'calypso' );` in your browser's developer tools console, then refresh the page
  * To disable state persistence, start Calypso with `DISABLE_FEATURES=persist-redux yarn start`
* How are you communicating 'loading' and 'empty' states? See how we approach [reactivity](reactivity.md).

It's also important to keep the general WP.com commit checklist at hand (modified for Calypso):

1. It must be responsive on phone, tablet, and desktop; interactions must be fluid on a touch device.
2. Test in IE11+, Chrome, Firefox, Mac/Win on the desktop.
3. Collect relevant and useful stats/events. What questions do they answer? How do you expect them to change over time?
4. All strings must be fully translatable (without concatenation, handling plurals), and you should be aware of how long strings affect layout.
5. Any visual assets involved must be HiDPI optimized and/or scalable.
6. Everything should be visually consistent both "internally", and across platforms.
