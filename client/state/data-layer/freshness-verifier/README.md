# Data Layer freshness verifier

## Background

Calypso components are allowed to dispatch request actions that specify their data needs (most of the times using query components). Normally the components don't need a request to be issued they just need data that is "fresh".

When a component has a data need it dispatches a request action. This leaves a problem, when the component is mounted, unmounted and mounted again 2 requests are executed even if the last one was executed seconds before. This behavior could be observable in comments, if a user shows, hide, shows the comments of a post 2 requests are generated. This happens in other cases and there are unnecessary requests being dispatched, possibly wasting data-usage, battery and CPU parsing the requests.

## Goals and characteristics

The goal of freshness verifier is to provide a way for data-layer users/handlers to specify that if a requester needs data at least as recently-updated as requested then it will happen, if data already requested is more recent than what was specified no aditional requests are made.
Data-layer handlers should provide a default amount of time for the request be considered fresh, but there are situations where we require data to be more recent than in other uses of the same data, so the requester should be able to configure the freshness value.

## API
The handler when using dispatchRequest needs to pass the options object a freshness property, that represents the default maximum amount of time passed since last execution for the request be considered fresh (and executed again).
e.g:
```js
[ COMMENTS_REQUEST ]: [ dispatchRequest( fetchPostComments, addComments, announceFailure, noop, { freshness: 10000 } ) ],
```
The freshness value the data-layer sets acts as a default value if a data requester has a particular need for a different freshness value it can pass that value in the action being dispatched as:
```js
{
 type: COMMENTS_REQUEST,
 siteId: 12886750,
 postId: 97,
 ...
 meta: {
     dataLayer: {
        freshness: 2000
     }     
 }
}
```
When a request is still fresh it does not trigger a network request.

The freshness mechanism is optional and it is possible opt-out if no freshness is set in the handler and in the action. If a freshness value is set in the handler but in a given component freshness should not be used it's possible to demand data as new as possible by setting `meta.dataLayer.freshness: 0` in the action being dispatched. Setting a freshness of zero is not recommended unless in the presence of a specific case where data as new as possible data is needed.

The freshness for a specific request action is determined in the following priority:
  1. from action metadata at `meta.dataLayer.freshness`
  2. from the optional `freshness` parameter in the call to `dispatchRequest()` in the data layer handler for the action type
  3. If no value is set in `meta.dataLayer.freshness` or in the `dispatchRequest()` call, freshness mechanism is not executed. Implying that requests will be instantly fetched as often as they dispatch.

In order to distinguish one request from another, the data-layer uses information of all the properties in the request action excluding meta properties. So if two request actions have all properties equal they are assumed to be the same request. If there is a difference in the properties, they are assumed to be different requests.

## A possible polling implementation

Polling should be used in the presence of a very specific situation where fresh data is needed and other approaches are not possible. e.g. keeping data updated that comes from an external service we don't control and no other update mechanism is possible.
In the presence of such a special case freshness mechanism mixed with the [interval component](https://github.com/Automattic/wp-calypso/tree/master/client/lib/interval) allows a simple polling solution.

The polling solution consists in adding the interval component to the render function of the query component where we need periodic requests. The interval component is used to periodically dispatch an action request with the freshness needed. The freshness mechanism avoids the number of requests being multiplied by the number of query components on the page because duplicate requests are removed.
If there exists more than one polling component and one component is unmount the polling continues because the other component continues to issue requests.
It is possible to safely add a "polling" query component to the places that need that fresh data. When the data is not needed by any component the requests will stop being executed.

A simple query component that each thirty seconds polls the number of posts of a given type in a site is implemented as follows:
```js
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { requestPostCounts } from 'state/posts/counts/actions';
import Interval, { EVERY_THIRTY_SECONDS } from 'lib/interval';

const QueryPostCounts = ( { siteId, type, requestPostCounts } ) => (
    <Interval onTick={ requestPostCounts( siteId, type ) } period={ EVERY_THIRTY_SECONDS } />
);

QueryPostCounts.propTypes = {
    siteId: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    requestPostCounts: PropTypes.func,
};

export default connect(
    null,
    { requestPostCounts }
)( QueryPostCounts );
```