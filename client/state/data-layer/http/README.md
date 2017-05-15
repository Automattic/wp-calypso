# Raw HTTP API Layer

[`wpcom-http`](../wpcom-http) issues requests to the WordPress.com API. However sometimes you will want to issue a request to another API, maybe even on a third-party host. This raw HTTP layer will allow you to do just that.

It follows the same API than `wpcom-http`, the only difference from the user's perspective being the action dispatched.

### Usage

So, let's say you would like to do a `POST` request to https://api.example.com when the action `GET_EXAMPLE_DATA` is dispatched, later continuing with `GET_EXAMPLE_DATA_COMPLETED` for the data or `GET_EXAMPLE_DATA_ERROR` for the error. You'll be able to do that with the following code (that could be located under `third-party`):

```js
import { 
	GET_EXAMPLE_DATA,
	GET_EXAMPLE_DATA_COMPLETED,
	GET_EXAMPLE_DATA_ERROR, 
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
	dispatch( { type: GET_EXAMPLE_DATA_COMPLETED, data } );

const receivedExampleDataError = ( { dispatch }, action, next, error ) => {
	dispatch( { type: GET_EXAMPLE_DATA_ERROR, error: error.response.body } );
};

export default {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: [
		dispatchRequest(
			requestExampleData,
			receivedExampleData,
			receivedExampleDataError
	 	)
	],
};

```

Under the hood it uses [`superagent`](https://github.com/visionmedia/superagent), for requests parameters see [`data-layer/http/actions.js`](./actions.js).
