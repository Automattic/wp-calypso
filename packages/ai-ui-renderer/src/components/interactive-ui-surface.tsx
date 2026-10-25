import { renderMarkdown } from '@a2ui/markdown-it';
import { A2uiSurface, MarkdownContext } from '@a2ui/react';
import { Component, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import clsx from 'clsx';
import { InteractiveUiSurfaceContext, InteractiveUiHostPropsContext } from '../contexts/surface';
import type { ComponentProps, ReactNode } from 'react';

type Surface = ComponentProps< typeof A2uiSurface >[ 'surface' ];

interface SurfaceErrorBoundaryProps {
	children: ReactNode;
	surface: Surface;
	fallback: ReactNode;
	revision: number;
}

class SurfaceErrorBoundary extends Component< SurfaceErrorBoundaryProps, { hasFailed: boolean } > {
	state = { hasFailed: false };

	static getDerivedStateFromError() {
		return { hasFailed: true };
	}

	componentDidCatch( error: unknown ) {
		void this.props.surface.dispatchError( {
			code: 'RENDER_FAILED',
			message: error instanceof Error ? error.message : String( error ),
		} );
	}

	componentDidUpdate( previous: Readonly< SurfaceErrorBoundaryProps > ) {
		if ( this.state.hasFailed && previous.revision !== this.props.revision ) {
			this.setState( { hasFailed: false } );
		}
	}

	render() {
		return this.state.hasFailed ? this.props.fallback : this.props.children;
	}
}

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
	/** Disables the surface's inputs and actions, including those in an open modal. */
	disabled?: boolean;
	/** Classes for the surface and its modal, such as A2UI's `a2ui-dark` or `a2ui-light`. */
	className?: string;
	/** A change retries a surface that failed to render. */
	revision?: number;
	/** Shown instead of a surface that fails to render or uses a component its catalog lacks. */
	fallback?: ReactNode;
	/**
	 * Props for the components that definitions add, such as the host's chat state. Pass a stable
	 * object: a new one re-renders those components.
	 */
	hostProps?: Record< string, unknown >;
}

/**
 * Renders a surface with Markdown once its root component has arrived, and the `fallback` if it
 * fails to render or uses a component its catalog lacks, reporting either through the runtime's
 * `onError`. Its root and component-type lookups don't subscribe, so hosts re-render after
 * processing messages.
 */
export function InteractiveUiSurface( {
	surface,
	disabled = false,
	className,
	revision = 0,
	fallback = null,
	hostProps = NO_HOST_PROPS,
}: InteractiveUiSurfaceProps ) {
	const rootRef = useRef< HTMLDivElement >( null );
	const [ isShowingErrors, setIsShowingErrors ] = useState( false );
	const surfaceContext = useMemo(
		() => ( {
			surfaceId: surface.id,
			disabled,
			isShowingErrors,
			showErrors: () => setIsShowingErrors( true ),
			className,
			rootRef,
		} ),
		[ surface.id, disabled, isShowingErrors, className ]
	);

	const unknownComponentType = getUnknownComponentType( surface );

	// A2UI would show a red placeholder for it, so show the fallback and report the type instead.
	useEffect( () => {
		if ( unknownComponentType ) {
			void surface.dispatchError( {
				code: 'UNKNOWN_COMPONENT_TYPE',
				message: `Unknown component type: ${ unknownComponentType }`,
				surfaceId: surface.id,
			} );
		}
	}, [ surface, unknownComponentType ] );

	if ( ! surface.componentsModel.has( surface.rootId ) ) {
		return null;
	}

	if ( unknownComponentType ) {
		return fallback;
	}

	return (
		<SurfaceErrorBoundary surface={ surface } fallback={ fallback } revision={ revision }>
			<InteractiveUiSurfaceContext.Provider value={ surfaceContext }>
				<InteractiveUiHostPropsContext.Provider value={ hostProps }>
					<MarkdownContext.Provider value={ renderMarkdown }>
						<div ref={ rootRef } className={ clsx( 'ai-ui-renderer', className ) }>
							<A2uiSurface surface={ surface } />
						</div>
					</MarkdownContext.Provider>
				</InteractiveUiHostPropsContext.Provider>
			</InteractiveUiSurfaceContext.Provider>
		</SurfaceErrorBoundary>
	);
}
