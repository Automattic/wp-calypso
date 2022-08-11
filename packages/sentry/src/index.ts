import type * as SentryApi from '@sentry/react';

type SupportedMethods =
	| 'addBreadcrumb'
	| 'captureEvent'
	| 'captureException'
	| 'captureMessage'
	| 'configureScope'
	| 'withScope';
interface QueueDataMethod< Method extends SupportedMethods > {
	f: Method;
	a: Parameters< typeof SentryApi[ Method ] >;
}

export interface A8cSentryGlobals {
	a8cSentryCallQueue?: Array< Readonly< QueueDataMethod< SupportedMethods > > >;
	a8cDispatchSentryMethodCall?: < Method extends SupportedMethods >(
		method: Method,
		args: Parameters< typeof SentryApi[ Method ] >
	) => void;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Window extends A8cSentryGlobals {}
}

function dispatchSentryMethodCall< Method extends SupportedMethods >(
	method: Method,
	args: Parameters< typeof SentryApi[ Method ] >
) {
	if ( window.a8cDispatchSentryMethodCall ) {
		window.a8cDispatchSentryMethodCall( method, args );
	} else {
		window.a8cSentryCallQueue = window.a8cSentryCallQueue || [];
		window.a8cSentryCallQueue.push( { f: method, a: args } );
	}
}

export function addBreadcrumb( ...args: Parameters< typeof SentryApi.addBreadcrumb > ) {
	dispatchSentryMethodCall( 'addBreadcrumb', args );
}
export function captureEvent( ...args: Parameters< typeof SentryApi.captureEvent > ) {
	dispatchSentryMethodCall( 'captureEvent', args );
}
export function captureException( ...args: Parameters< typeof SentryApi.captureException > ) {
	dispatchSentryMethodCall( 'captureException', args );
}
export function captureMessage( ...args: Parameters< typeof SentryApi.captureMessage > ) {
	dispatchSentryMethodCall( 'captureMessage', args );
}
export function configureScope( ...args: Parameters< typeof SentryApi.configureScope > ) {
	dispatchSentryMethodCall( 'configureScope', args );
}
export function withScope( ...args: Parameters< typeof SentryApi.withScope > ) {
	dispatchSentryMethodCall( 'withScope', args );
}
