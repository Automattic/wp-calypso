/**
 * Markdown-related actions for the AgentChat store
 */

import type { Components } from 'react-markdown';
import type { MarkdownExtensions } from '../../markdown-extensions';

export const registerMarkdownComponents = (
	components: Components
): {
	type: 'REGISTER_MARKDOWN_COMPONENTS';
	components: Components;
} => ( {
	type: 'REGISTER_MARKDOWN_COMPONENTS' as const,
	components,
} );

export const registerMarkdownExtensions = (
	extensions: MarkdownExtensions
): {
	type: 'REGISTER_MARKDOWN_EXTENSIONS';
	extensions: MarkdownExtensions;
} => ( {
	type: 'REGISTER_MARKDOWN_EXTENSIONS' as const,
	extensions,
} );

export const clearMarkdownComponents = () => ( {
	type: 'CLEAR_MARKDOWN_COMPONENTS' as const,
} );

export const clearMarkdownExtensions = () => ( {
	type: 'CLEAR_MARKDOWN_EXTENSIONS' as const,
} );

// Export action types for reducer
export type MarkdownAction =
	| ReturnType< typeof registerMarkdownComponents >
	| ReturnType< typeof registerMarkdownExtensions >
	| ReturnType< typeof clearMarkdownComponents >
	| ReturnType< typeof clearMarkdownExtensions >;
