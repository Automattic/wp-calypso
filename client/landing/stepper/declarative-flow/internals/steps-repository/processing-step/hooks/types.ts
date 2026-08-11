import React from 'react';

export interface LoadingMessage {
	title: string;
	subtitle?: string | React.ReactNode;
	/**
	 * How long to show this message, in milliseconds. `Infinity` holds it
	 * indefinitely and is only valid on the final entry of a list.
	 */
	duration: number;
}
