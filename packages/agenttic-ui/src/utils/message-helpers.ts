import React from 'react';
import type { Message } from '../types';

/**
 * Format a timestamp for display
 * @param timestamp
 */
export const formatTimestamp = ( timestamp: number ): string => {
	const date = new Date( timestamp );
	return date.toLocaleTimeString( [], {
		hour: '2-digit',
		minute: '2-digit',
	} );
};

/**
 * Extract text content from a message
 * @param message
 */
export const getMessageText = ( message: Message ): string => {
	return message.content
		.filter( ( content ) => content.type === 'text' )
		.map( ( content ) => content.text )
		.join( ' ' );
};

/**
 * Create an image component for display in messages
 * @param url      - The image URL
 * @param maxWidth - Maximum width (defaults to 40% so 2 images fit in a row)
 */
export const createImageComponent = ( url: string, maxWidth = '40%' ) => ( {
	type: 'component' as const,
	component: () =>
		React.createElement( 'img', {
			src: url,
			alt: 'Uploaded image',
			style: {
				maxWidth,
				height: 'auto',
				borderRadius: '8px',
				marginTop: '8px',
				marginRight: '8px',
				display: 'inline-block',
			},
		} ),
} );

/**
 * Check if a message has component content
 * @param message
 */
export const hasComponentContent = ( message: Message ): boolean => {
	return message.content.some( ( content ) => content.type === 'component' );
};

/**
 * Get React components from a message
 * @param message
 */
export const getComponents = ( message: Message ): React.ComponentType[] => {
	return message.content
		.filter( ( content ) => content.type === 'component' )
		.map( ( content ) => content.component )
		.filter( Boolean ) as React.ComponentType[];
};

/**
 * Check if a message is a thinking message
 * @param message
 */
export const isThinkingMessage = ( message: Message ): boolean => {
	const text = getMessageText( message );
	return text.toLowerCase().includes( 'thinking' ) || text.includes( '...' );
};

/**
 * Check if a message is a completed plan message
 * @param message
 */
export const isCompletedPlanMessage = ( message: Message ): boolean => {
	const text = getMessageText( message );
	return text.includes( 'CompletedPlan' );
};

/**
 * Create a user message
 * @param text
 * @param imageUrls - Optional image URLs (will be converted to component parts)
 */
export const createUserMessage = (
	text: string,
	imageUrls: string[] = []
): Message => {
	return {
		id: crypto.randomUUID(),
		role: 'user',
		content: [
			{ type: 'text', text },
			...imageUrls.map( ( url ) => createImageComponent( url ) ),
		],
		timestamp: Date.now(),
		archived: false,
		showIcon: true,
	};
};

/**
 * Create an agent message
 * @param text
 * @param additionalProps
 */
export const createAgentMessage = (
	text: string,
	additionalProps: Partial< Message > = {}
): Message => {
	return {
		id: crypto.randomUUID(),
		role: 'agent',
		content: [ { type: 'text', text } ],
		timestamp: Date.now(),
		archived: false,
		showIcon: true,
		...additionalProps,
	};
};

/**
 * Sort messages by creation time
 * @param messages
 */
export const sortMessagesByTime = ( messages: Message[] ): Message[] => {
	return [ ...messages ].sort( ( a, b ) => a.timestamp - b.timestamp );
};

/**
 * Filter out archived messages
 * @param messages
 */
export const getActiveMessages = ( messages: Message[] ): Message[] => {
	return messages.filter( ( message ) => ! message.archived );
};

/**
 * Return messages for rendering: strip `context` and `data` blocks
 * (read programmatically, not displayed) and drop any message left empty.
 * @param messages
 */
export const getVisibleMessages = ( messages: Message[] ): Message[] => {
	return messages
		.map( ( message ) => ( {
			...message,
			content: message.content.filter(
				( content ) =>
					content.type !== 'context' && content.type !== 'data'
			),
		} ) )
		.filter( ( message ) => message.content.length > 0 );
};
