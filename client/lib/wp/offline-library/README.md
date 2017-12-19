# Offline Library

The purpose of this module is to facilitate offline-development of Calypso.
Under normal operations Calypso requires a working connection to the internet
in order to boot. This can be frustrating to those wanting to work on it while
on a plane, while hiking in the mountains, while waiting for dinner at a
restaurant without WiFi available, while driving, or in many other offline scenarios.

Being able to develop the product while offline brings a number of advantages to
the developer workflow and can improve our ability to deterministically test and
automate important metrics.

Although this module limits its scope to requests made through `wpcom.js`, it enables
a workable offline environment in which to test.

## Overview

Working offline isn't automated. There are a number of challenging issues to resolve
before Calypso can work as intended offline. Thankfully, for development purposes we
can reach a reasonable approximation of offline by caching network requests and
replaying them when requested. An offline cache also allows us to hand-craft specific
network responses in order to test specific circumstances in the application.

> This module is only loaded in a local development environment and only runs when
> specifically requested via config flags or from the query string of the initial
> app load.

Working offline thus involves two steps: _priming the cache_ and then _activating the
cache_.

### Priming the cache

We will be performing the most basic and naive approach of offline support: caching
network requests, including their authentication. _Priming_ is the process of
pre-loading the network requests we anticipate using while offline. If we don't
prime a given request then it will fail at runtime when offline.

The easiest way to get started is to load Calypso with the priming flag set in the
browser path's query string. Make sure that you are connected to the internet when
loading this page.

```
http://calypso.localhost:3000/?wpcom_priming=1
```

Once the application loads, start navigating around and using whatever functionality
you expect to work with later. You can save changes in the editor, load feed posts,
open site settings, read notifications, and any activity. Every request will be
recorded in memory.

When finished priming, we need to save this request cache so we can load it later.
From the development tools for your browser, open the console and run `saveRequests()`.

`saveRequests()` should compile a JSON document of primed requests that you can save
to `cached-requests.json` in the project root of Calypso.

### Activating the cache

Once saved, the `cached-requests.json` file contains all of the information necessary
to fake network requests. It is organized by request path; feel free to examine or
modify it before using it.

We will activate the cache much like we primed it. The easiest way is to include the
flag in the browser path's query string on the initial page load. You can disconnect
from your network at this point.

```
http://calypso.localhost:3000/?wpcom_offline=1
```

Requests should serve identically as when they were primed. If you primed a `POST`
request then you should be able to replay it as long as the parameters and body themselves
are identical. Sometimes we may have to undo changes after priming in order to bring the
state back into a place where we can replay the original requests (such as when editing posts).

## Notes

Because this is flagged behind the local development environment this should never appear
in the production bundle. It should also not load unless specifically requested. When it
_does_ run it may pull in many megabtyes of data via the `require()` which loads the cache.
