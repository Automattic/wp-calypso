Merge Checklist
===============

This document aims to provide a list of things to check and test whenever you are working on a pull request — or when you are reviewing one — for Calypso.

* Run `make test` from the calypso root to make sure all tests pass.
* Test with multiple individual sites, and All My Sites. Does everything work as expected? Use the site switcher and directly via URL.
* Test scenarios where your feature intentionally doesn't work (e.g. not supported on Jetpack)
* Explicitly test with a Jetpack-powered site. Calypso features should all work with Jetpack sites unless they are strictly WordPress.com-only.
* Test different user privileges (admin, editor, author). How does your code behave?
* Run `localStorage.clear()`! Your code needs to handle an empty slate, plus incoming data.
* How are you communicating 'loading' and 'empty' states? See how we approach [reactivity](reactivity.md).

It's also important to keep the general WP.com commit checklist at hand (modified for Calypso):

1. It must be responsive on phone, tablet, and desktop; interactions must be fluid on a touch device. Responsive goes both ways, be sure to test with the `is-fluid-width` feature flag enabled. An easy way to do that is to add `is-fluid-width` as a CSS class to the `html` tag using the web-inspector.
2. Test in IE11+, Chrome, Firefox, Mac/Win on the desktop.
3. Collect relevant and useful stats/events. What questions do they answer? How do you expect them to change over time?
4. All strings must be fully translatable (without concatenation, handling plurals), and you should be aware of how long strings affect layout.
5. Any visual assets involved must be HiDPI optimized and/or scalable.
6. Everything should be visually consistent both "internally", and across platforms.
