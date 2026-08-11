/**
 * Creates a configured message renderer component
 *
 * This factory creates a React component that renders markdown content
 * with the specified extensions and custom components.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';
import { mergeMarkdownComponents, processMarkdownExtensions } from '../markdown-extensions';
import type { MarkdownExtensions } from '../markdown-extensions/types';

// Re-export types for consumers
export type MarkdownComponents = Components;
export type { MarkdownExtensions } from '../markdown-extensions/types';

type StreamingUtils = {
	parseIncompleteMarkdown: ( text: string ) => string;
	parseMarkdownIntoBlocks: ( markdown: string ) => Promise< string[] >;
};

let streamingUtils: StreamingUtils | null = null;
let streamingPromise: Promise< StreamingUtils > | null = null;

async function loadStreamingUtils(): Promise< StreamingUtils > {
	if ( streamingUtils ) {
		return streamingUtils;
	}
	if ( streamingPromise ) {
		return streamingPromise;
	}

	streamingPromise = Promise.all( [
		import( './streaming/parseIncompleteMarkdown' ),
		import( './streaming/parseBlocks' ),
	] ).then( ( [ incomplete, blocks ] ) => {
		streamingUtils = {
			parseIncompleteMarkdown: incomplete.parseIncompleteMarkdown,
			parseMarkdownIntoBlocks: blocks.parseMarkdownIntoBlocks,
		};
		return streamingUtils;
	} );

	return streamingPromise;
}

interface CreateMessageRendererOptions {
	components?: Components;
	extensions?: MarkdownExtensions;
	remarkPlugins?: PluggableList;
	enableStreaming?: boolean;
}

/**
 * Creates a message renderer component with pre-configured markdown settings
 * @param options - Configuration options for markdown rendering
 * @returns A React component that renders markdown with the specified configuration
 */
export function createMessageRenderer(
	options: CreateMessageRendererOptions = {}
): React.ComponentType< { children: string } > {
	const { components = {}, extensions = {}, remarkPlugins = [], enableStreaming = false } = options;

	// Process extensions once when creating the renderer
	const processed = processMarkdownExtensions( extensions );

	// Merge extension components with user components (user takes precedence)
	const finalComponents = mergeMarkdownComponents( processed.components, components );

	// Merge extension plugins with user plugins
	const finalPlugins = [ ...processed.remarkPlugins, ...remarkPlugins ];

	// Return a component that renders markdown with all the configuration
	return function MessageRenderer( { children }: { children: string } ) {
		const [ processedText, setProcessedText ] = React.useState( children );

		React.useEffect( () => {
			if ( enableStreaming ) {
				loadStreamingUtils()
					.then( async ( utils ) => {
						const blocks = await utils.parseMarkdownIntoBlocks( children );
						const processedContent = blocks
							.map( ( block ) => {
								return utils.parseIncompleteMarkdown( block.trim() );
							} )
							.join( '\n\n' );
						setProcessedText( processedContent );
					} )
					.catch( () => {
						setProcessedText( children );
					} );
			} else {
				setProcessedText( children );
			}
		}, [ children ] );

		return (
			<ReactMarkdown components={ finalComponents } remarkPlugins={ finalPlugins }>
				{ processedText }
			</ReactMarkdown>
		);
	};
}
