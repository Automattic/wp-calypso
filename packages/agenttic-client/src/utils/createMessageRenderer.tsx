/**
 * Creates a configured message renderer component
 *
 * This factory creates a React component that renders markdown content
 * with the specified extensions and custom components.
 */

import React from 'react';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';
import {
	mergeMarkdownComponents,
	processMarkdownExtensions,
} from '../markdown-extensions';
import type { MarkdownExtensions } from '../markdown-extensions/types';

interface CreateMessageRendererOptions {
	components?: Components;
	extensions?: MarkdownExtensions;
	remarkPlugins?: PluggableList;
}

/**
 * Creates a message renderer component with pre-configured markdown settings
 * @param options - Configuration options for markdown rendering
 * @return A React component that renders markdown with the specified configuration
 */
export function createMessageRenderer(
	options: CreateMessageRendererOptions = {}
): React.ComponentType< { children: string } > {
	const { components = {}, extensions = {}, remarkPlugins = [] } = options;

	// Process extensions to get components and plugins
	const processed = processMarkdownExtensions( extensions );

	// Merge extension components with user components (user takes precedence)
	const finalComponents = mergeMarkdownComponents(
		processed.components,
		components
	);

	// Merge extension plugins with user plugins
	const finalPlugins = [ ...processed.remarkPlugins, ...remarkPlugins ];

	// Return a component that renders markdown with all the configuration
	return function MessageRenderer( { children }: { children: string } ) {
		return (
			<Markdown
				components={ finalComponents }
				remarkPlugins={ finalPlugins }
			>
				{ children }
			</Markdown>
		);
	};
}
