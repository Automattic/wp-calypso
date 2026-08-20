import React from 'react';

export interface LoadingMessage {
	title: string;
	subtitle?: string | React.ReactNode;
	/**
	 * How long to show this message, in milliseconds. The last entry of a list always holds
	 * until the wait ends, whatever its duration; `Infinity` there records that intent.
	 * Anywhere else a non-positive or non-finite duration falls back to a default.
	 */
	duration: number;
}
