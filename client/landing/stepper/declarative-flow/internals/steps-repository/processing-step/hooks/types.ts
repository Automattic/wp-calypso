import React from 'react';

export interface LoadingMessage {
	title: string;
	subtitle?: string | React.ReactNode;
	duration: number;
}
