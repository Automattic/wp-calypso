import { renderMarkdown } from '@a2ui/markdown-it';
import { A2uiSurface, MarkdownContext } from '@a2ui/react/v0_9';
import { Component } from '@wordpress/element';
import { InteractiveUiDisabledContext } from './context';
import type { InteractiveUiRuntime } from './runtime';
import type { ReactNode } from 'react';
import './style.css';

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

export interface InteractiveUiSurfaceProps {
	surface: NonNullable< ReturnType< InteractiveUiRuntime[ 'getSurface' ] > >;
	revision?: number;
	isDisabled?: boolean;
}

export function InteractiveUiSurface( {
	surface,
	revision = 0,
	isDisabled = false,
}: InteractiveUiSurfaceProps ) {
	if ( ! surface.componentsModel.has( surface.rootId ) ) {
		return null;
	}

	return (
		<fieldset data-agenttic-isolated className="automattic-interactive-ui" disabled={ isDisabled }>
			<SurfaceBoundary revision={ revision }>
				<InteractiveUiDisabledContext.Provider value={ isDisabled }>
					<MarkdownContext.Provider value={ renderMarkdown }>
						<A2uiSurface surface={ surface } />
					</MarkdownContext.Provider>
				</InteractiveUiDisabledContext.Provider>
			</SurfaceBoundary>
		</fieldset>
	);
}
