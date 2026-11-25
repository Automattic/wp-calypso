# bilmur-spa

This library wraps `bilmur-spa.min.js`, a Single Page Application-friendly version of Bilmur, Automattic's RUM (Real User Metrics) data collection tool. It handles the hard navigation duties of regular `bilmur`, but also introduces dedicated soft navigation functionality, thus providing a clearer picture on overall performance in SPAs.

`bilmur-spa.min.js` is built to be used as a library, not as a standalone script. It's served as an ES module, and it's the consumers' responsibility to import it, initialise it, and notify when navigations start and end, as well as what to name them. `bilmur-spa.min.js` then combines this information with browser-based measurements to beacon a number of performance metrics for the explicitly-declared soft navigation.

In Calypso, this library (`lib/bilmur-spa`) wraps `bilmur-spa.min.js`, importing it at runtime (it's not bundled) and handling communication with it. Clients should call `loadBilmurSpa()` at boot and use `startNavigation()` and `completeNavigation()` to signal when navigations start and end.

This functionality is behind the `bilmur-spa` feature flag. When the flag is enabled, the standalone `bilmur` script is no longer loaded, but the same `<meta id="bilmur">` configuration tag is still added to the page, for `bilmur-spa.min.js` to read. Another flag, `bilmur_spa_beacon_origin`, sets the origin to which to send the beacons, which is helpful to prevent them from reaching production when testing in a development environment.

## Main app

`main-app.tsx` handles the integration with the main app:

- `trackNavigationStart` is a route middleware that signals the start of each navigation, which gets named after the section it leads to.
- `withNavigationComplete()` wraps the layouts that routes render, and signals the navigation as complete.
- `#primary` is the route region (the region of the document where routes get rendered), marked with `data-bilmur-route-region` in both layouts.

## Developing

There is only one build of `bilmur-spa.min.js`, which is meant to be used in both production and development environments. To avoid polluting production with dev data, and to allow for easier debugging, the development configs set `bilmur_spa_beacon_origin` to `/` and pass that to `bilmur-spa.min.js` via its `beaconOrigin` parameter. This way, beacons still get sent, but to the page origin and not the production endpoint.

To start a development server with `bilmur-spa` enabled, and with beacons sent to the dev server:

```bash
ENABLE_FEATURES=bilmur-spa yarn start
```

The reports go to `/boom.gif` (page load, i.e., hard navigation) and `/spa-day.gif` (soft navigations). The dev server replies with a 404, since these resources don't exist in dev and there's no special handling for them.

A navigation's report is sent when the next one starts or the page is hidden. Chrome sends them with `fetchLater()`, which don't get shown in the network panel; run `window.fetchLater = undefined` in the console to see the reports of later navigations there.
