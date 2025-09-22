/**
 * Dynamic Markdown Utilities
 *
 * Provides conditional loading of streamdown vs react-markdown based on streaming configuration
 */

import React from 'react';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';

// Type definitions for streamdown (to avoid importing the whole package)
interface StreamdownProps {
	children: string;
	components?: Components;
	remarkPlugins?: PluggableList;
}

type StreamdownComponent = React.ComponentType< StreamdownProps >;

// Cache for the dynamically imported components
let streamdownComponent: StreamdownComponent | null = null;
let streamdownPromise: Promise< StreamdownComponent > | null = null;

// Create the lazy ReactMarkdown component only once to avoid re-creation on every render
const LazyReactMarkdown = React.lazy( () => import( 'react-markdown' ) );

/**
 * Dynamically import streamdown only when needed
 */
async function getStreamdownComponent(): Promise< StreamdownComponent > {
	if ( streamdownComponent ) {
		return streamdownComponent;
	}

	if ( streamdownPromise ) {
		return streamdownPromise;
	}

	streamdownPromise = import( 'streamdown' ).then( ( module ) => {
		streamdownComponent = module.default;
		return streamdownComponent;
	} );

	return streamdownPromise;
}

/**
 * Markdown component that conditionally uses streamdown or react-markdown
 */
interface ConditionalMarkdownProps {
	children: string;
	components?: Components;
	remarkPlugins?: PluggableList;
	withStreamdown?: boolean;
}

export function ConditionalMarkdown( {
	children,
	components,
	remarkPlugins,
	withStreamdown = false,
}: ConditionalMarkdownProps ): React.ReactElement {
	const [ StreamdownComponent, setStreamdownComponent ] =
		React.useState< StreamdownComponent | null >( null );
	const [ isLoading, setIsLoading ] = React.useState( withStreamdown );

	React.useEffect( () => {
		if ( withStreamdown && ! StreamdownComponent ) {
			getStreamdownComponent()
				.then( ( component ) => {
					console.log( 'Loaded streamdown component' );
					setStreamdownComponent( component );
					setIsLoading( false );
				} )
				.catch( ( error ) => {
					// eslint-disable-next-line no-console
					console.warn(
						'Failed to load streamdown, falling back to react-markdown:',
						error
					);
					setIsLoading( false );
				} );
		}
	}, [ withStreamdown, StreamdownComponent ] );

	// If streamdown is not requested, use react-markdown directly
	if ( ! withStreamdown ) {
		return (
			<React.Suspense fallback={ <div>{ children }</div> }>
				<LazyReactMarkdown
					components={ components }
					remarkPlugins={ remarkPlugins }
				>
					{ children }
				</LazyReactMarkdown>
			</React.Suspense>
		);
	}

	// If streamdown is requested but still loading, show fallback
	if ( isLoading || ! StreamdownComponent ) {
		return <div>{ children }</div>;
	}

	// Use streamdown for streaming
	return (
		<StreamdownComponent
			components={ components }
			remarkPlugins={ remarkPlugins }
		>
			{ children }
		</StreamdownComponent>
	);
}
