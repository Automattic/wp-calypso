import { renderMarkdown } from '@a2ui/markdown-it';
import { A2uiSurface, MarkdownContext } from '@a2ui/react/v0_9';
import { Component } from '@wordpress/element';
import { InteractiveUiDisabledContext } from './context';
import type { ComponentProps, ReactNode } from 'react';

interface SurfaceBoundaryProps {
	children: ReactNode;
	revision: number;
}

class SurfaceBoundary extends Component< SurfaceBoundaryProps, { hasFailed: boolean } > {
	state = { hasFailed: false };

	static getDerivedStateFromError() {
		return { hasFailed: true };
	}

	componentDidUpdate( previous: Readonly< SurfaceBoundaryProps > ) {
		if ( this.state.hasFailed && previous.revision !== this.props.revision ) {
			this.setState( { hasFailed: false } );
		}
	}

	render() {
		return this.state.hasFailed ? null : this.props.children;
	}
}

interface InteractiveUiSurfaceProps {
	surface: ComponentProps< typeof A2uiSurface >[ 'surface' ];
	/** Disables the surface's controls, including those in an open modal. */
	disabled?: boolean;
	/** A change retries a surface that failed to render. */
	revision?: number;
}

/**
 * Renders a surface with Markdown once its root component has arrived, and renders nothing if
 * it fails to render.
 */
export function InteractiveUiSurface( {
	surface,
	disabled = false,
	revision = 0,
}: InteractiveUiSurfaceProps ) {
	if ( ! surface.componentsModel.has( surface.rootId ) ) {
		return null;
	}

	return (
		<SurfaceBoundary revision={ revision }>
			<InteractiveUiDisabledContext.Provider value={ disabled }>
				<MarkdownContext.Provider value={ renderMarkdown }>
					<fieldset className="ai-ui-renderer" disabled={ disabled }>
						<A2uiSurface surface={ surface } />
					</fieldset>
				</MarkdownContext.Provider>
			</InteractiveUiDisabledContext.Provider>
		</SurfaceBoundary>
	);
}
