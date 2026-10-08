import { Component } from '@wordpress/element';
import type { A2uiPresentation } from './use-a2ui';
import type { ReactNode } from 'react';

class SurfaceBoundary extends Component<
	{ children: ReactNode; revision: number },
	{ failed: boolean }
> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidUpdate( previous: Readonly< { children: ReactNode; revision: number } > ) {
		if ( this.state.failed && previous.revision !== this.props.revision ) {
			this.setState( { failed: false } );
		}
	}

	render() {
		return this.state.failed ? null : this.props.children;
	}
}

export default function A2UI( {
	messageId,
	presentation,
}: {
	messageId: string;
	presentation: A2uiPresentation;
} ) {
	const { runtime, sdk, revision, isDisabled } = presentation;
	if ( ! runtime || ! sdk ) {
		return null;
	}
	const { A2uiSurface: Surface, MarkdownContext, renderMarkdown } = sdk;
	return runtime.getSurfaceIds( messageId ).map( ( surfaceId ) => {
		const surface = runtime.getSurface( surfaceId );
		return surface?.componentsModel.has( surface.rootId ) ? (
			<fieldset
				key={ surfaceId }
				disabled={ isDisabled }
				style={ { border: 0, padding: 0, margin: 0, minWidth: 0 } }
			>
				<SurfaceBoundary revision={ revision }>
					<MarkdownContext.Provider value={ renderMarkdown }>
						<Surface surface={ surface } />
					</MarkdownContext.Provider>
				</SurfaceBoundary>
			</fieldset>
		) : null;
	} );
}
