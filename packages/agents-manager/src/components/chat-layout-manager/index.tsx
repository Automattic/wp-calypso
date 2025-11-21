/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Icon, comment } from '@wordpress/icons';
import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

/**
 * Internal dependencies
 */
import './style.scss';

export interface ChatLayoutManagerRenderProps {
	isDocked: boolean;
	isDesktop: boolean;
	dock: () => void;
	undock: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
}

export interface ChatLayoutManagerProps {
	/**
	 * Render prop that receives sidebar state and control functions
	 */
	children: ( props: ChatLayoutManagerRenderProps ) => ReactNode;
	/**
	 * Target container for the sidebar (CSS selector or HTMLElement)
	 */
	sidebarContainer: string | HTMLElement;
	/**
	 * Start in undocked/floating mode
	 * @default false
	 */
	defaultUndocked?: boolean;
	/**
	 * Open sidebar by default when docked
	 * @default false
	 */
	defaultOpen?: boolean;
	/**
	 * Media query for desktop breakpoint
	 * @default '(min-width: 1200px)'
	 */
	desktopMediaQuery?: string;
	/**
	 * Custom class name prefix (defaults to 'agents-manager')
	 * @default 'agents-manager'
	 */
	classNamePrefix?: string;
	/**
	 * Custom icon for FAB button
	 * @default comment (WordPress comment icon)
	 */
	fabIcon?: JSX.Element;
	/**
	 * Custom label for FAB button
	 * @default 'Open Chat'
	 */
	fabLabel?: string;
	/**
	 * Callback when sidebar is opened
	 */
	onOpenSidebar?: () => void;
	/**
	 * Callback when sidebar is closed
	 */
	onCloseSidebar?: () => void;
	/**
	 * Callback when docked
	 */
	onDock?: () => void;
	/**
	 * Callback when undocked
	 */
	onUndock?: () => void;
}

/**
 * ChatLayoutManager Component
 *
 * Manages a sidebar/dock interface using React Portal.
 * Toggles between docked (embedded) and floating modes based on screen size.
 * Provides render prop pattern for flexible content rendering.
 * @param {ChatLayoutManagerProps} props - Component props
 */
export default function ChatLayoutManager( {
	children,
	sidebarContainer,
	defaultUndocked = false,
	defaultOpen = false,
	desktopMediaQuery = '(min-width: 1200px)',
	classNamePrefix = 'agents-manager',
	fabIcon = <Icon icon={ comment } />,
	fabLabel = __( 'Open Chat', 'agents-manager' ),
	onOpenSidebar = () => {},
	onCloseSidebar = () => {},
	onDock = () => {},
	onUndock = () => {},
}: ChatLayoutManagerProps ) {
	const [ sidebar, setSidebar ] = useState< HTMLElement | null >( null );
	const isDesktop = useMediaQuery( desktopMediaQuery );
	const [ isDocked, setIsDocked ] = useState( ! defaultUndocked );
	const shouldRenderSidebar = isDesktop && isDocked;
	const openSidebarTimeoutRef = useRef< number | null >( null );

	// Store callback refs to ensure latest versions are called without triggering re-renders
	const onDockRef = useRef( onDock );
	const onUndockRef = useRef( onUndock );
	onDockRef.current = onDock;
	onUndockRef.current = onUndock;

	// Class names
	const containerClass = `${ classNamePrefix }-sidebar-container`;
	const containerOpenClass = `${ classNamePrefix }-sidebar-container--sidebar-open`;
	const sidebarClass = `${ classNamePrefix }-sidebar`;
	const fabClass = `${ classNamePrefix }-sidebar__fab`;

	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect( () => {
		const container =
			typeof sidebarContainer === 'string'
				? document.querySelector< HTMLElement >( sidebarContainer )
				: sidebarContainer;

		if ( ! container ) {
			return;
		}

		const currSidebar = container.querySelector< HTMLElement >( `.${ sidebarClass }` );

		// Add sidebar
		if ( shouldRenderSidebar && ! currSidebar ) {
			container.classList.add( containerClass );

			// Open the sidebar by default if requested
			if ( defaultOpen ) {
				container.classList.add( containerOpenClass );
			}

			const sidebarElement = document.createElement( 'div' );
			sidebarElement.className = sidebarClass;

			container.appendChild( sidebarElement );
			setSidebar( sidebarElement );

			onDockRef.current();
		}

		// Remove sidebar
		if ( ! shouldRenderSidebar && currSidebar ) {
			container.classList.remove( containerOpenClass );

			container.removeChild( currSidebar );
			setSidebar( null );

			onUndockRef.current();
		}
	}, [
		defaultOpen,
		shouldRenderSidebar,
		sidebarContainer,
		containerClass,
		containerOpenClass,
		sidebarClass,
	] );

	// Cleanup when navigating away from the page
	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect(
		() => () => {
			if ( openSidebarTimeoutRef.current !== null ) {
				clearTimeout( openSidebarTimeoutRef.current );
			}

			const container = document.querySelector< HTMLElement >( `.${ containerClass }` );

			if ( ! container ) {
				return;
			}

			container.classList.remove( containerClass, containerOpenClass );

			const currSidebar = container.querySelector( `.${ sidebarClass }` );

			if ( currSidebar ) {
				container.removeChild( currSidebar );
			}
		},
		[ containerClass, containerOpenClass, sidebarClass ]
	);

	const handleOpenSidebar = () => {
		const container = document.querySelector< HTMLElement >( `.${ containerClass }` );

		// To avoid duplicate class names
		if ( container && ! container.classList.contains( containerOpenClass ) ) {
			container.classList.add( containerOpenClass );
		}

		onOpenSidebar();
	};

	const handleCloseSidebar = () => {
		document.querySelector( `.${ containerClass }` )?.classList.remove( containerOpenClass );

		onCloseSidebar();
	};

	const dock = () => {
		setIsDocked( true );

		// Wait for the sidebar to be added to the DOM and then open it if not already opened
		if ( openSidebarTimeoutRef.current !== null ) {
			clearTimeout( openSidebarTimeoutRef.current );
		}
		openSidebarTimeoutRef.current = window.setTimeout( handleOpenSidebar, 100 );
	};

	const undock = () => {
		setIsDocked( false );
	};

	const commonArgs: ChatLayoutManagerRenderProps = {
		isDesktop,
		dock,
		undock,
		openSidebar: handleOpenSidebar,
		closeSidebar: handleCloseSidebar,
		isDocked: false,
	};

	if ( ! sidebar || ! shouldRenderSidebar ) {
		return <>{ children( commonArgs ) }</>;
	}

	return createPortal(
		<>
			{ children( { ...commonArgs, isDocked: true } ) }
			<Button className={ fabClass } onClick={ handleOpenSidebar } label={ fabLabel }>
				{ fabIcon }
			</Button>
		</>,
		sidebar
	);
}
