import { renderMarkdown } from '@a2ui/markdown-it';
import { A2uiSurface as SdkSurface, MarkdownContext } from '@a2ui/react/v0_9';
import { Spinner } from '@wordpress/components';
import { Component, useCallback, useSyncExternalStore } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { A2uiRuntime } from './runtime';
import type { ReactNode } from 'react';

declare const __i18n_text_domain__: string;

class SurfaceErrorBoundary extends Component<
	{ children: ReactNode; revision: number },
	{ failed: boolean }
> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidUpdate( previousProps: Readonly< { children: ReactNode; revision: number } > ) {
		if ( this.state.failed && previousProps.revision !== this.props.revision ) {
			this.setState( { failed: false } );
		}
	}

	render() {
		return this.state.failed ? (
			<p role="alert">{ __( 'This form could not be displayed.', __i18n_text_domain__ ) }</p>
		) : (
			this.props.children
		);
	}
}

export function A2uiSurface( { runtime, surfaceId }: { runtime: A2uiRuntime; surfaceId: string } ) {
	const getRevision = useCallback(
		() => runtime.getSurfaceRevision( surfaceId ),
		[ runtime, surfaceId ]
	);
	const revision = useSyncExternalStore( runtime.subscribe, getRevision );
	const surface = runtime.getSurface( surfaceId );
	return surface ? (
		<SurfaceErrorBoundary key={ surfaceId } revision={ revision }>
			<MarkdownContext.Provider value={ renderMarkdown }>
				{ surface.componentsModel.has( surface.rootId ) ? (
					<SdkSurface surface={ surface } />
				) : (
					<Spinner role="status" aria-label={ __( 'Loading form', __i18n_text_domain__ ) } />
				) }
			</MarkdownContext.Provider>
		</SurfaceErrorBoundary>
	) : null;
}
