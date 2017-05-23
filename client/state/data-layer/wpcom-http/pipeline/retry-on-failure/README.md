# Retry network requests on failure

In 1985 Jim Gray proposed the following conjecture<sup>1</sup>…

> most production…faults are soft. If…reinitialized and…retried, the operation will usually not fail the second time.

This suggests that there are a large variety of bugs in software due to inexplicable and ephemeral causes.
Many of our network connections experience these types of _Heisenbugs_ which occur at random and are hard to debug.
This pipeline processor exists to limit the extent to which these temporary failures impact Calypso and those developers writing code which interacts with HTTP requests.

## What is a failed network request?

There are two reasons a network request can fail.
The first is because the request was invalid and the remote server legitimately returned an error.
The second is because something along the network path failed even though the request was legitimate.
Network failures can occur on slow network connections, when transitioning from one network to another, when physical cables are cut, when routers crash, and in one of any number of different ways.

Because most of these failures are transient we can pause before considering a failed request as a true failure.
A _failed request_ is one which fails after we have given it every reasonable attempt to succeed.

## What happens with failing requests?

We really don't want to have to write separate error handlers for these kinds of transient faults in every bit of code which interacts with HTTP requests.
Instead, we can apply _policies_ to the request descriptions which indicate how failures should be treated and provide a default behavior.
When the request comes back as a failure we track its state and simply resend the request (if we determine that we can).
Repeated failures are compared against the state tracking to determine if we should continue to attempt resending it.
Once the _reasonable effort_ has been exhausted we consider the request truly as a failure and reinject it to the HTTP layer where the `onFailure` action will be dispatched.

### How can we safely replay a failed network request?

Certain requests are assumed to be _safe_ and _idempotent_ if they are `GET` requests with matching `path`, version, and `query` parameters.

## Failure modes and policies
<!-- diagram made in draw.io and source XML found at https://cldup.com/H2-4aSzJup.xml -->

### No retry
![](https://cldup.com/SlUCoIuzkX.svg)

This policy means that once a request has failed we should _not_ attempt to retry it.
Instead, the request should immediately fail.
This should be used for requests which Calypso might think are safe to resend but which aren't.
In the diagram we can see that the initial request failed and then immediately the HTTP layer dispatched the `onFailure` action.

### Simple retry
![](https://cldup.com/FQFuTX5CFq.svg)

Please don't use this policy unless you have a very good reason not to use the exponential-backoff.
Simple retries get reissued at a fixed interval after a failed request comes in.
In the diagram we can see an attempt made with `maxAttempts` set to `3`.
Once the initial request comes in as a failure we wait for `delay` ms and then send it out again.
The same thing happens again after the second retry attempt.
However, after the third attempt we give up because we limited the `maxAttempts` and the HTTP layer finally dispatches the `onFailure` action.

### Exponential-backoff
![](https://cldup.com/_QCxJGuCXu.svg)

Exponential backoff behaves similarly to the _simple retry_ policy except that for each failure we receive for any given request, we wait progressively longer before reattempting.
In the diagram we can see how after the initial request fails we send it out again after the initial delay in ms has passed.
However, after that second attempt comes back in as a failure we don't simply wait for the original delay again.
In order to give more time for adverse circumstances to correct themselves we double the waiting time and reissue after that new delay.
This doubling happens on each failure until we have reached the maximum number of retry attempts whereupon the HTTP layer gives up and dispatches `onFailure`.


## Usage

Without any specific effort a default policy attaches to the network requests.
At the time of writing this is the exponential-backoff retry policy with an initial delay of 500 ms and up to three attempts.

If we want to choose a different default policy all we need do is add the `whenFailing` override to the HTTP request description.

```js
// stop retry attempts
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

dispatch( http( {
	path: '/sites',
	method: 'GET',
	onSuccess,
	onFailure,
	whenFailing: noRetry(),
}, action );

// try twice one after the other
import { simpleRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

dispatch( http( {
	path: '/sites',
	method: 'GET',
	onSuccess,
	onFailure,
	whenFailing: simpleRetry( { delay: 300, maxAttempts: 2 } ),
}, action );

// moar attempts for a notoriously slow and buggy server
import { exponentialBackoff } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

dispatch( http( {
	path: '/sites',
	method: 'GET',
	onSuccess,
	onFailure,
	whenFailing: exponentialBackoff( { delay: 4000, maxAttempts: 5 } ),
}, action );
```

**Notes**

<sup>1</sup> Tandem Technical Report 85.7, June 1985, PN87614
