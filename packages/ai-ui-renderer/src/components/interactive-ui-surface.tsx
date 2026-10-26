import { renderMarkdown } from '@a2ui/markdown-it';
import { A2uiSurface, MarkdownContext } from '@a2ui/react';
import { Component, useEffect, useMemo, useRef } from '@wordpress/element';
import clsx from 'clsx';
import { InteractiveUiSurfaceContext, InteractiveUiHostPropsContext } from '../contexts/surface';
import type { ComponentProps, ReactNode } from 'react';

interface SurfaceErrorBoundaryProps {
	children: ReactNode;
	revision: number;
}

class SurfaceErrorBoundary extends Component< SurfaceErrorBoundaryProps, { hasFailed: boolean } > {
	state = { hasFailed: false };

	static getDerivedStateFromError() {
		return { hasFailed: true };
	}

	componentDidUpdate( previous: Readonly< SurfaceErrorBoundaryProps > ) {
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

// A2UI resolves each component's catalog: the one it names, or else the surface's.
function getUnknownComponentType( surface: Surface ) {
	for ( const [ , component ] of surface.componentsModel.entries ) {
		if ( ! component.catalog.components.has( component.type ) ) {
			return component.type;
		}
	}

	return undefined;
}

interface InteractiveUiSurfaceProps {
	surface: Surface;
	/** Disables the surface's controls, including those in an open modal. */
	disabled?: boolean;
	/** Classes for the surface and its modal, such as A2UI's `a2ui-dark` or `a2ui-light`. */
	className?: string;
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
	className,
	revision = 0,
	hostProps = NO_HOST_PROPS,
}: InteractiveUiSurfaceProps ) {
	const rootRef = useRef< HTMLFieldSetElement >( null );
	const surfaceContext = useMemo(
		() => ( { surfaceId: surface.id, disabled, className, rootRef } ),
		[ surface.id, disabled, className ]
	);

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
		<SurfaceErrorBoundary revision={ revision }>
			<InteractiveUiSurfaceContext.Provider value={ surfaceContext }>
				<InteractiveUiHostPropsContext.Provider value={ hostProps }>
					<MarkdownContext.Provider value={ renderMarkdown }>
						<fieldset
							ref={ rootRef }
							className={ clsx( 'ai-ui-renderer', className ) }
							disabled={ disabled }
						>
							<A2uiSurface surface={ surface } />
						</fieldset>
					</MarkdownContext.Provider>
				</InteractiveUiHostPropsContext.Provider>
			</InteractiveUiSurfaceContext.Provider>
		</SurfaceErrorBoundary>
	);
}
