// The SDK is loaded through this module rather than the `@sentry/react` namespace, so the
// lazy chunk only carries what we call instead of the whole SDK (Replay, Feedback, tracing).
export {
	addBreadcrumb,
	captureEvent,
	captureException,
	captureMessage,
	init,
	setTag,
	setUser,
	withScope,
} from '@sentry/react';
