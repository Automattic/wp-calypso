import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { createPortal, useCallback, useLayoutEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { AI } from '../../components/icons';
import './style.scss';

interface Options {
	defaultUndocked?: boolean;
	defaultOpen?: boolean;
	desktopMediaQuery?: string;
	onOpenSidebar?: () => void;
	onCloseSidebar?: () => void;
	onDock?: () => void;
	onUndock?: () => void;
}

interface ReturnValue {
	isDocked: boolean;
	isDesktop: boolean;
	dock: () => void;
	undock: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	maybeCreateSidebarPortal: ( children: React.ReactNode ) => React.ReactNode | React.ReactPortal;
}

export default function useSidebarManager(
	sidebarContainer: string | HTMLElement,
	{
		defaultUndocked = false,
		defaultOpen = false,
		desktopMediaQuery = '(min-width: 1200px)',
		onOpenSidebar = () => {},
		onCloseSidebar = () => {},
		onDock = () => {},
		onUndock = () => {},
	}: Options = {}
): ReturnValue {
	const [ sidebar, setSidebar ] = useState< HTMLDivElement | null >( null );
	const isDesktop = useMediaQuery( desktopMediaQuery );
	const [ isDocked, setIsDocked ] = useState( ! defaultUndocked );
	const shouldRenderSidebar = isDesktop && isDocked;
	const isSidebarRendered = !! sidebar && shouldRenderSidebar;
	const openSidebarTimeoutRef = useRef< number >();

	// Store callback refs to ensure latest versions are called without triggering re-renders
	const onDockRef = useRef( onDock );
	const onUndockRef = useRef( onUndock );
	const onOpenSidebarRef = useRef( onOpenSidebar );
	const onCloseSidebarRef = useRef( onCloseSidebar );
	onDockRef.current = onDock;
	onUndockRef.current = onUndock;
	onOpenSidebarRef.current = onOpenSidebar;
	onCloseSidebarRef.current = onCloseSidebar;

	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect( () => {
		const container =
			typeof sidebarContainer === 'string'
				? document.querySelector< HTMLElement >( sidebarContainer )
				: sidebarContainer;

		if ( ! container ) {
			return;
		}

		const currSidebar = container.querySelector( '.big-sky-sidebar' );

		// Add sidebar
		if ( shouldRenderSidebar && ! currSidebar ) {
			container.classList.add( 'big-sky-sidebar-container' );

			if ( defaultOpen ) {
				container.classList.add( 'big-sky-sidebar-container--sidebar-open' );
			}

			const sidebarElement = document.createElement( 'div' );
			sidebarElement.className = 'big-sky-sidebar';

			container.appendChild( sidebarElement );
			setSidebar( sidebarElement );

			onDockRef.current();
		}

		// Remove sidebar
		if ( ! shouldRenderSidebar && currSidebar ) {
			container.classList.remove( 'big-sky-sidebar-container--sidebar-open' );

			container.removeChild( currSidebar );
			setSidebar( null );

			onUndockRef.current();
		}
	}, [ defaultOpen, shouldRenderSidebar, sidebarContainer ] );

	// Cleanup when navigating away from the page
	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect(
		() => () => {
			clearTimeout( openSidebarTimeoutRef.current );

			const container = document.querySelector( '.big-sky-sidebar-container' );

			if ( ! container ) {
				return;
			}

			container.classList.remove(
				'big-sky-sidebar-container',
				'big-sky-sidebar-container--sidebar-open'
			);

			const currSidebar = container.querySelector( '.big-sky-sidebar' );

			if ( currSidebar ) {
				container.removeChild( currSidebar );
			}
		},
		[]
	);

	const handleOpenSidebar = useCallback( () => {
		const container = document.querySelector( '.big-sky-sidebar-container' );

		// To avoid duplicate class names
		if (
			container &&
			! container.classList.contains( 'big-sky-sidebar-container--sidebar-open' )
		) {
			container.classList.add( 'big-sky-sidebar-container--sidebar-open' );
		}

		onOpenSidebarRef.current();
	}, [] );

	const handleCloseSidebar = useCallback( () => {
		document
			.querySelector( '.big-sky-sidebar-container' )
			?.classList.remove( 'big-sky-sidebar-container--sidebar-open' );

		onCloseSidebarRef.current();
	}, [] );

	const dock = useCallback( () => {
		setIsDocked( true );

		// Wait for the sidebar to be added to the DOM and then open it if not already opened
		clearTimeout( openSidebarTimeoutRef.current );
		openSidebarTimeoutRef.current = setTimeout( handleOpenSidebar, 100 );
	}, [ handleOpenSidebar ] );

	const undock = useCallback( () => setIsDocked( false ), [] );

	const maybeCreateSidebarPortal = useCallback(
		( children: React.ReactNode ) =>
			isSidebarRendered
				? createPortal(
						<>
							{ children }
							<Button
								className="big-sky-sidebar__fab"
								icon={ AI }
								onClick={ handleOpenSidebar }
								label={ __( 'Open Chat', 'big-sky' ) }
							/>
						</>,
						sidebar
				  )
				: children,
		[ handleOpenSidebar, isSidebarRendered, sidebar ]
	);

	return {
		isDocked: isSidebarRendered,
		isDesktop,
		dock,
		undock,
		openSidebar: handleOpenSidebar,
		closeSidebar: handleCloseSidebar,
		maybeCreateSidebarPortal,
	};
}
