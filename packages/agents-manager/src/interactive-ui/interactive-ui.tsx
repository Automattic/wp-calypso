import { Button } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { InteractiveUiPresentation } from '../hooks/use-interactive-ui';
import type { ReactNode } from 'react';
import '@automattic/ai-ui-renderer/style.scss';
import './modal.scss';

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

export default function InteractiveUi( {
	messageId,
	presentation,
}: {
	messageId: string;
	presentation: InteractiveUiPresentation;
} ) {
	const { runtime, sdk, revision, isDisabled, hasLoadError, retryLoad } = presentation;
	if ( hasLoadError ) {
		return (
			<div role="alert">
				<p>{ __( 'This form could not be loaded.', __i18n_text_domain__ ) }</p>
				<Button variant="secondary" onClick={ retryLoad }>
					{ __( 'Try again', __i18n_text_domain__ ) }
				</Button>
			</div>
		);
	}
	if ( ! runtime || ! sdk ) {
		return null;
	}
	const { InteractiveUiSurface: Surface, MarkdownContext, renderMarkdown } = sdk;
	return runtime.getSurfaceIds( messageId ).map( ( surfaceId ) => {
		const surface = runtime.getSurface( surfaceId );
		return surface?.componentsModel.has( surface.rootId ) ? (
			<div key={ surfaceId } data-agenttic-isolated>
				<SurfaceBoundary revision={ revision }>
					<MarkdownContext.Provider value={ renderMarkdown }>
						<Surface surface={ surface } disabled={ isDisabled } />
					</MarkdownContext.Provider>
				</SurfaceBoundary>
			</div>
		) : null;
	} );
}
