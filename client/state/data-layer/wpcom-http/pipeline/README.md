# HTTP pipeline

The HTTP middleware is designed to take liberties in how it performs the actual network transactions requests by various components inside of Calypso.
On the surface the HTTP middleware proper simply passes along every request which it receives.
This _pipeline_ however intercepts that stream of requests in order to augment it with: optimizations, request transformations, offline queuing, etc…

## Overview

Requests come into the HTTP layer on Redux actions and leave when the network requests return with either a success or failure.
Each request is run through the pipeline at these points.
The initial entry into the HTTP system is through the outbound pipeline.
The final exit from the HTTP system is through the inbound pipeline.

- _**Outbound**_ denotes requests on their way _out_ of Calypso.
- _**Inbound**_ denotes requests returning from remote servers back _into_ Calypso.

### Outbound

Outbound requests run through the pipeline as if it were some kind of funnel or chain.
At this stage we can perform the following kinds of operations on the requests:

- filter out and drop unnecessary or redundant requests
- transform them by manipulating their data
- queue them for later if offline
- persist them to storage

### Inbound

Inbound requests run through the pipeline to provide a way to follow-up with requests previously sent out.
At this stage we can perform the following kinds of operations on the requests:

- Clean up and close out operations started on inbound
- Audit and perform accounting on requests as they come back (for example, track failed requests)

## Detailed Operation

To understand how this layer works we should start by examining the normal flow of HTTP requests and then see how we can augment that flow by inserting optimizations or processes into the pipeline.

### The basic HTTP flow without the pipeline

<!-- the following diagram was generated in draw.io - it can be edited by pasting in the contents of the SVG itself -->

![Basic HTTP flow](https://cldup.com/X4mRbNKSaC.svg)

#### Step A: HTTP request actions are dispatched

Redux middleware can dispatch certain actions which describe HTTP requests to the WordPress.com API.
These actions include information such as the API path, query arguments, request body, etc…
The actions flow through the normal Redux dispatch chain and can be inspected with the Redux tools.

#### Step B: HTTP layer intercepts requests

The HTTP middleware handler intercepts the request actions and performs the actual network requests and response-handling.
It is the piece that ties together outbound requests with the follow-up actions on upload progress, success, and failure events.

#### Step C: Request is sent outbound

When a request goes out "on the wire" there is an implicit tracking of that request in what we could consider a queue.
At the time of this writing this tracking takes place within a `Promise` and its `then()` and `catch()` methods.

#### Step D: Request returns or fails

Requests come back in and are re-associated with the action that called for them.

#### Step E: Follow-up actions are dispatched

If the original action contained an `onSuccess` or `onFailure` responder (also a Redux action) then that will be dispatched in response according to the success or failure state of the network request.

### HTTP flow _with_ the pipeline

The pipeline injects itself at the inbound and outbound of the actual network operations.
It is the gatekeeper and the overseer.

These gates are designed to introduce augmentation, introspection, and optimization into the HTTP layer which are _specifically_ and _only_ related to HTTP requests.

**This is absolutely _not_ the place to introduce code concerning itself with other concerns.**
The HTTP layer is given liberty to execute the requests fed into it in a way that it sees fit.
Because of this liberty it must also constrain itself to the language of HTTP to prevent accidentally introducing bugs or breaking assumptions that other code will be making.

<!-- the following diagram was generated in draw.io - it can be edited by pasting in the contents of the SVG itself -->

![Pipelined HTTP flow](https://cldup.com/lpS7pC7Ksj.svg)

#### Step F: Outbound pipeline

As Redux actions describing HTTP requests feed into the HTTP middleware the outbound chain gets called with the given action.
The chain can drop the request, modify the request, add additional requests, etc…

For the sake of illustration, let's consider adding a function to make sure that we don't send out requests whose `GET` line exceeds 2,048 characters.
IE and some other browsers and routers will fail in these conditions.

This new function finds the sum of the lengths of the URL for the request and the query string and will throw a new error if it exceeds our limit and drop the request if we're in a development environment.
It will do this in order to and notify a developer that the request will likely fail in production.

#### Step G: Inbound pipeline

Once network requests return or fail they will feed back into the Redux system by way of the associated `onSuccess` and `onFailure` actions if they were provided on the original action.
Before these are run we have the same kinds of abilities we had to interact with HTTP requests on outbound, except now those abilities relate to the follow-up actions: we can prevent them from running, change which ones run, or add additional actions to run.

Further, we can introduce additional behaviors to run based on these responses.
For the sake of illustration, let's consider adding a function to help us know which API endpoints need some help in their error reporting.

This new function will only activate itself if the request comes back _from_ the API with an error status code.
It will then inspect the response to see if there was both a simple "error code" or "error type" such as `INVALID_DOMAIN` as well as a written description like `The given domain (wordpress.com) could not be found in our records`.

In the cases where one of these is missing we can send a new network request to our logging servers so that indicate that some API is giving hazy error messages.
