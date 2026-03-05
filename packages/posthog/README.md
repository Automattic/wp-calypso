# PostHog

A thin wrapper around [posthog-js](https://github.com/PostHog/posthog-js) that provides a simple interface for initializing PostHog with user identification and session tracking.

## Usage

```js
import { init } from '@automattic/posthog';

init( 'your-api-key', {
	ID: 12345,
	email: 'user@example.com',
	username: 'user',
} );
```

The `init` function is safe to call multiple times; it will only initialize PostHog once.

### Retrieving the session ID

```js
import { getSessionId } from '@automattic/posthog';

const sessionId = getSessionId();
```

### Resetting

Call `reset` to clear the current PostHog session (e.g. on logout):

```js
import { reset } from '@automattic/posthog';

reset();
```
