# HTTP API Layer

[`wpcom-http`](../data-layer/wpcom-http) issues requests to the WordPress.com API. However sometimes you will want to issue a request to another API, maybe even on a third-party host. This raw HTTP layer will allow you to do just that.

It follows the same API as `wpcom-http`, the only difference from the user's perspective being the action dispatched.

### Usage

So, let's say you would like to do a `POST` request to <https://api.example.com> when the action `GET_EXAMPLE_DATA` is dispatched, later continuing with `EXAMPLE_DATA_ADD` for the data or `NOTICE_CREATE` for the error. You'll be able to do that with the following code (that could be located under `third-party`):

```js
import {
	GET_EXAMPLE_DATA,
	EXAMPLE_DATA_ADD,
	NOTICE_CREATE,
} from 'state/action-types';
import { dispatchRequest } from 'state/wpcom-http/utils';
import { http } from 'state/http/actions';
import { get } from 'lodash';

const requestExampleData = action =>
	http( {
		url: 'https://api.example.com/endpoint',
		method: 'POST',
		headers: [
			[ 'Content-Type', 'application/x-www-form-urlencoded' ],
		],
		body: {
			user_id: 123,
		},
	}, action );
};

const receivedExampleData = ( action, data ) =>
	{
		type: EXAMPLE_DATA_ADD,
		data,
	};

const receivedExampleDataError = ( action, error ) => {
	{
		type: NOTICE_CREATE,
		notice: {
			text: get( error, 'response.body.error', null ),
		},
	};

export default {
	[ GET_EXAMPLE_DATA ]: [
		dispatchRequest(
			fetch: requestExampleData,
			onSuccess: receivedExampleData,
			onError: receivedExampleDataError,
	 	)
	],
};
```

For requests parameters see [`state/http/actions.js`](./actions.js).
