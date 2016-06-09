# Connection Middleware

Connection Middleware is used instead of `redux-thunk` to easier manage API communication.

## Usage

To initiate connection to API, you need 2 parts

- action that starts a connection
- function that handles it

### Action

To promote optimistic updating of UI, connection can only be initiated when corresponding action has been dispatched
We recommend handling that action in reducer and UI in an optimistic manner.

### Function

Connection function is what handles your actual endpoint communication. We recommend writing it in pure manner and storing in `connections.js` file.
Wpcom reference will be injected in a higher scope.
Your connectionFunction should dispatch appropriate `SUCCESS` action upon success and `FAILURE` action upon failure.
Simple connectionFunction would look like this:
```
const myConnectionFunction = wpcom => ( action, dispatch ) {
    dispatch( { type: SUCCESS } );
}

```

### Binding action and connection together

To register a connection, simply:

```
import { registerConnection } from 'state/connectionMiddleware/middleware';
registerConnection( ACTION_TYPE_TRIGGERING_A_CALL, myConnectionFunction );

```

We recommend doing it in `actions.js`, so that it is easy to grasp what is happening after an action is dispatched.


## Writing tests

This approach decouples `FETCH` and `SUCCESS/FAILURE` actionTypes. So:
- your `FETCH` action should return a pure object and treat is as such
- connectionFunction should be a pure function returning a function. You should not need to mock any imports to test it.

To test your connectionFunction you can use `createWpcomSpy` that wraps sinon spy into a path in a similar fashion as wpcom does:
```
it( 'should dispatch "SITE_PLANS_FETCH_COMPLETED" upon success', () => {
    const wpcom = createWpcomSpy(
        [ 'undocumented', 'getSitePlans' ],
        ( siteId, callback ) => callback( null, {} )
    );
    connectFetchSitePlans( wpcom )( { siteId: 5 }, dispatchMock );
    expect(
        dispatchMock.calledWithMatch( { type: SITE_PLANS_FETCH_COMPLETED, siteId: 5 } )
    ).ok;
} );
```

## Work in progress

Other benefits possible because of decoupling FETCH actions from connection handling:
- throttling API calls
- batching requests
- storing actions in a queue while offline
- debouncing
- less action / state mixing that happen because of `getState` in `thunk`
