/**
 * Markdown Parser Utility
 *
 * Converts markdown text to React components using react-markdown
 * with custom components and extensions support.
 */

import React from 'react';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import {
	mergeMarkdownComponents,
	processMarkdownExtensions,
} from '../markdown-extensions';
import type { MarkdownExtensions } from '../markdown-extensions/types';

// Use the same Components type as react-markdown for consistency
export type MarkdownComponents = Components;

// Re-export the MarkdownExtensions type from the extensions module
export type { MarkdownExtensions } from '../markdown-extensions/types';

interface ParseMarkdownOptions {
	components?: MarkdownComponents;
	extensions?: MarkdownExtensions;
}

/**
 * Parses markdown text into a React component using react-markdown
 * @param text    - The markdown text to parse
 * @param options - Custom components and extensions to use
 * @return React element containing the parsed markdown
 */
export function parseMarkdownToComponent(
	text: string,
	options: ParseMarkdownOptions = {}
): React.ReactElement {
	const { components, extensions } = options;

	// Process extensions to get extension-specific components
	const extensionComponents = processMarkdownExtensions( extensions );

	// User components are already in the correct Components format
	const userComponents: Components = components || {};

	// Merge extension components with user components (user takes precedence)
	const finalComponents = mergeMarkdownComponents(
		extensionComponents,
		userComponents
	);

	return <Markdown components={ finalComponents }>{ text }</Markdown>;
}
