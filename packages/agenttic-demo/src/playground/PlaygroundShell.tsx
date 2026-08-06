import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DemoDefinition } from './demos';
import './playground.css';

const ViewToolsContext = createContext< HTMLElement | null >( null );

const HeaderHeightContext = createContext< number >( 0 );

/**
 * Live height of the shell header, for demos that need to keep floating UI
 * out from under it (e.g. AgentUI's `boundaryTopInset`).
 */
export function usePlaygroundHeaderHeight() {
	return useContext( HeaderHeightContext );
}

/**
 * Renders its children into the shell header's view-tools slot. Each demo
 * uses this to expose its own controls without a second fixed overlay.
 *
 * @param props          Component props.
 * @param props.children Toolbar content to portal into the header.
 */
export function ViewTools( { children }: { children: React.ReactNode } ) {
	const slot = useContext( ViewToolsContext );
	if ( ! slot ) {
		return null;
	}
	return createPortal( children, slot );
}

/**
 * Standard toolbar button for demo view tools.
 *
 * @param props          Component props.
 * @param props.active   Toggled-on state (rendered via aria-pressed).
 * @param props.accent   Highlights the button for destructive/attention actions.
 * @param props.onClick  Click handler.
 * @param props.title    Optional tooltip.
 * @param props.children Button label.
 */
export function ToolButton( {
	active,
	accent,
	onClick,
	title,
	children,
}: {
	active?: boolean;
	accent?: boolean;
	onClick: () => void;
	title?: string;
	children: React.ReactNode;
} ) {
	return (
		<button
			type="button"
			className={ `playground-tool${ accent ? ' is-accent' : '' }` }
			aria-pressed={ active }
			title={ title }
			onClick={ onClick }
		>
			{ children }
		</button>
	);
}

interface PlaygroundShellProps {
	demos: DemoDefinition[];
	currentDemoId: string;
	onSelectDemo: ( id: string ) => void;
	currentTheme: 'light' | 'dark';
	onThemeChange: ( theme: 'light' | 'dark' ) => void;
	children: React.ReactNode;
}

/**
 * Unified playground chrome: a single header with demo tabs, theme toggle,
 * and a slot for the active demo's tools; the demo fills the canvas below.
 *
 * @param props Component props.
 */
const PlaygroundShell: React.FC< PlaygroundShellProps > = ( props ) => {
	const {
		demos,
		currentDemoId,
		onSelectDemo,
		currentTheme,
		onThemeChange,
		children,
	} = props;
	const [ toolsSlot, setToolsSlot ] = useState< HTMLElement | null >( null );
	const [ headerEl, setHeaderEl ] = useState< HTMLElement | null >( null );
	const [ headerHeight, setHeaderHeight ] = useState( 0 );

	// Track the header's live height (the tools row wraps at narrow widths).
	useEffect( () => {
		if ( ! headerEl ) {
			return;
		}
		const observer = new ResizeObserver( () => {
			setHeaderHeight( headerEl.offsetHeight );
		} );
		observer.observe( headerEl );
		return () => observer.disconnect();
	}, [ headerEl ] );

	return (
		<div className="playground">
			<header className="playground-header" ref={ setHeaderEl }>
				<div className="playground-header__row">
					<nav className="playground-tabs" aria-label="Demos">
						{ demos.map( ( demo ) => (
							<button
								key={ demo.id }
								type="button"
								className="playground-tab"
								aria-pressed={ demo.id === currentDemoId }
								onClick={ () => onSelectDemo( demo.id ) }
							>
								{ demo.label }
							</button>
						) ) }
					</nav>
					<div
						className="playground-theme"
						role="group"
						aria-label="Theme"
					>
						{ ( [ 'light', 'dark' ] as const ).map( ( theme ) => (
							<button
								key={ theme }
								type="button"
								className="playground-tab"
								aria-pressed={ currentTheme === theme }
								onClick={ () => onThemeChange( theme ) }
							>
								{ theme }
							</button>
						) ) }
					</div>
				</div>
				<div className="playground-header__row">
					<div
						className="playground-view-tools"
						ref={ setToolsSlot }
					/>
				</div>
			</header>
			<main className="playground-canvas">
				<ViewToolsContext.Provider value={ toolsSlot }>
					<HeaderHeightContext.Provider value={ headerHeight }>
						{ children }
					</HeaderHeightContext.Provider>
				</ViewToolsContext.Provider>
			</main>
		</div>
	);
};

export default PlaygroundShell;
