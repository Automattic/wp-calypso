import { renderMarkdown } from '@a2ui/markdown-it';
import { A2uiSurface, MarkdownContext } from '@a2ui/react/v0_9';
import { Component, useEffect } from '@wordpress/element';
import { InteractiveUiDisabledContext, InteractiveUiHostPropsContext } from './context';
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

type Surface = ComponentProps< typeof A2uiSurface >[ 'surface' ];

const NO_HOST_PROPS = {};

// Matches A2UI: a component uses the catalog it names, if any, or else the surface's.
function getUnknownComponentType( surface: Surface ) {
	for ( const [ , component ] of surface.componentsModel.entries ) {
		const catalog = component.catalog?.components.size ? component.catalog : surface.defaultCatalog;

		if ( ! catalog.components.has( component.type ) ) {
			return component.type;
		}
	}

	return undefined;
}

interface InteractiveUiSurfaceProps {
	surface: Surface;
	/** Disables the surface's controls, including those in an open modal. */
	disabled?: boolean;
	/** A change retries a surface that failed to render. */
	revision?: number;
	/**
	 * Props for the components that definitions add, such as the host's chat state. Pass a stable
	 * object: a new one re-renders those components.
	 */
	hostProps?: Record< string, unknown >;
}

/**
 * Renders a surface with Markdown once its root component has arrived, and nothing if it fails
 * to render or uses a component its catalog lacks. The checks don't subscribe, so hosts re-render
 * after processing messages.
 */
export function InteractiveUiSurface( {
	surface,
	disabled = false,
	revision = 0,
	hostProps = NO_HOST_PROPS,
}: InteractiveUiSurfaceProps ) {
	const unknownComponentType = getUnknownComponentType( surface );

	// A2UI would show a red placeholder for it, so hide the surface and report the type instead.
	useEffect( () => {
		if ( unknownComponentType ) {
			void surface.dispatchError( {
				code: 'UNKNOWN_COMPONENT_TYPE',
				message: `Unknown component type: ${ unknownComponentType }`,
				surfaceId: surface.id,
			} );
		}
	}, [ surface, unknownComponentType ] );

	if ( ! surface.componentsModel.has( surface.rootId ) || unknownComponentType ) {
		return null;
	}

	return (
		<SurfaceBoundary revision={ revision }>
			<InteractiveUiDisabledContext.Provider value={ disabled }>
				<InteractiveUiHostPropsContext.Provider value={ hostProps }>
					<MarkdownContext.Provider value={ renderMarkdown }>
						<fieldset className="ai-ui-renderer" disabled={ disabled }>
							<A2uiSurface surface={ surface } />
						</fieldset>
					</MarkdownContext.Provider>
				</InteractiveUiHostPropsContext.Provider>
			</InteractiveUiDisabledContext.Provider>
		</SurfaceBoundary>
	);
}
