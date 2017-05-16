# Raw HTTP API Layer

[`wpcom-http`](../wpcom-http) issues requests to the WordPress.com API. However sometimes you will want to issue a request to another API, maybe even on a third-party host. This raw HTTP layer will allow you to do just that.

It follows the same API as `wpcom-http`, the only difference from the user's perspective being the action dispatched.

### Usage

So, let's say you would like to do a `POST` request to https://api.example.com when the action `GET_EXAMPLE_DATA` is dispatched, later continuing with `EXAMPLE_DATA_ADD` for the data or `NOTICE_CREATE` for the error. You'll be able to do that with the following code (that could be located under `third-party`):

```js
import { 
	GET_EXAMPLE_DATA,
	EXAMPLE_DATA_ADD,
	NOTICE_CREATE,
} from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { rawHttp } from 'state/data-layer/http/actions';

const requestExampleData = ( { dispatch }, action ) => {
	dispatch( rawHttp( {
		url: 'https://api.example.com/endpoint',
		method: 'POST',
		headers: [
			[ 'Content-Type', 'application/x-www-form-urlencoded' ],
		],
		body: {
			user_id: 123,
		}
	}, action ) );
};

const receivedExampleData = ( { dispatch }, action, next, data ) =>
	dispatch( { type: EXAMPLE_DATA_ADD, data } );

const receivedExampleDataError = ( { dispatch }, action, next, error ) => {
	dispatch( { type: NOTICE_CREATE, notice: { text: error.response.body.error } } );
};

export default {
	[ GET_EXAMPLE_DATA ]: [
		dispatchRequest(
			requestExampleData,
			receivedExampleData,
			receivedExampleDataError
	 	)
	],
};
```

For requests parameters see [`data-layer/http/actions.js`](./actions.js).
