import React from 'react';

export interface LoadingMessage {
	title: string;
	subtitle?: string | React.ReactNode;
	duration: number;
}

/**
 * Flow-provided shape for the `loadingMessages` accepts-prop. `duration` is
 * optional here (it falls back to a default) so a flow can override the
 * carousel copy without having to time each message.
 */
export interface ProcessingLoadingMessage {
	title: string;
	subtitle?: string | React.ReactNode;
	duration?: number;
}
