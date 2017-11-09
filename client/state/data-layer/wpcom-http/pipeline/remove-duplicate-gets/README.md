# Remove "duplicate" GET requests

Let's be honest, networks are flakey.
Requests fail; packet TTLs are disregarded; and routers return cached values.
Because this is how the internet works, and despite its gloomy outlook,
it affords us great freedom in our ability to process and modify outgoing
network requests.

This pipeline processor examines `GET` requests and makes a decision if they
are "identical" to previous requests. If it finds anything that it considers
a duplicate it will make a determination whether to _actually_ issue the
request or "fake it" and rely on the response from previous calls.

What this means is that it's possible that when two `GET` calls are requested
which share the same path, method, API version, query parameters, etc…, that
only a single network request will traverse the internet and that both callers
will get back the same results from that single request.

One might suggest that calling code could depend on the fact that a second
request is issued and that it's issued after the first one. Our situation with
HTTP however unfortunately breaks these assumptions already; we might even have
the second request arrive at the server before the first one does, and this is
just part-and-parcel of how the internet works.

## `dedupeWindow`

By default requests are only "faked" or dropped from the actual network while
existing identical requests are "on the wire" or in transit between this app
and the remote servers.

However, we can add some latency into the system by providing a value to the
`dedupeWindow` option on the HTTP request action. This value describes a
period of time after a previous "identical" request has been issued in which
all new matching requests will be dropped.

For example, suppose we add a `dedupeWindow` of `1000`, representing one
second (in ms) and we issue a request for the posts on a given site. If no
previous request has been issued for those posts then our request will go
out immediately.

If, on the other hand, a request has already gone out and we are waiting for it
to return, then regardless of the `dedupeWindow` value our request will never
go out. When the first request returns we will find its response as if it
had been the response to our own requested network call.

Finally, if there are no requests currently "on the wire" but it has only been
100ms since the last one came back, then we have encoded in this value the
constraint that 100ms old is _new enough_ for our purposes and we want to
use the result of the previous requests as if it were our newly-requested call.
Our "request" will return immediately with the stale data but we will neither
know the difference nor care.

## Use-case?

Where would we want to use this kind of system? Well it turns out that it's a
quite handy way of simplifying or removing all sorts of logic in the app. By
preventing sending the same requests out at the same time we can eliminate any
need we might have otherwise had to store `isRequesting` type values in app
state. We can trust that if we send out a request but one is already taking
place that we can just forget about it and the system will handle it for us.

Additionally, by extending the window of time in which we consider deduplicating
requests we can ease a common dilemma in our UI design. Components which require
data should be free to simply announce their needs without immediately triggering
repeated network activity. If a component only cares that it has data which has
been retrieved within the past five minutes it should not trigger new network
requests on every render. By setting this value we can free ourselves from trying
to start tracking the requests across the app just to prevent network optimization.
If it's on the HTTP request action, the system handles it and we can code the
way which is easiest or most clear for us to do so in our components.
