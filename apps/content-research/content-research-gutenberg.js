import ContentResearchSidebar from '@automattic/content-research';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, KeyboardShortcuts } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { PluginMoreMenuItem } from '@wordpress/editor';
import {
	createPortal,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp, closeSmall, Icon, search } from '@wordpress/icons';
import { rawShortcut } from '@wordpress/keycodes';
import { registerPlugin } from '@wordpress/plugins';
import './content-research.scss';

const queryClient = new QueryClient();

const OPEN_CONTENT_RESEARCH_WINDOW_EVENT = 'content-research:open-window';
const INTERFACE_CONTENT_SELECTOR = '.interface-interface-skeleton__content';
const WINDOW_MARGIN = 16;
const INTERFACE_CONTENT_INSET = 10;
const DEFAULT_WINDOW_WIDTH = 380;
const DEFAULT_WINDOW_HEIGHT = 600;
const CONTENT_RESEARCH_SHORTCUT = rawShortcut.primaryAlt( 'g' );

function handleContentResearchShortcut( event ) {
	event.preventDefault();
	dispatchOpenWindowEvent();
}

function getViewport() {
	if ( typeof window === 'undefined' || typeof document === 'undefined' ) {
		return {
			width: DEFAULT_WINDOW_WIDTH + WINDOW_MARGIN * 2,
			height: DEFAULT_WINDOW_HEIGHT + WINDOW_MARGIN * 2,
		};
	}

	return {
		width: document.documentElement.clientWidth || window.innerWidth,
		height: document.documentElement.clientHeight || window.innerHeight,
	};
}

function clampWindowPosition( position, node ) {
	const viewport = getViewport();
	const width = node?.offsetWidth || DEFAULT_WINDOW_WIDTH;
	const height = node?.offsetHeight || DEFAULT_WINDOW_HEIGHT;
	const maxX = Math.max( 0, viewport.width - width );
	const maxY = Math.max( 0, viewport.height - height );

	return {
		x: Math.min( Math.max( position.x, 0 ), maxX ),
		y: Math.min( Math.max( position.y, 0 ), maxY ),
	};
}

function getInterfaceContentWindowPosition( node ) {
	if ( typeof document === 'undefined' ) {
		return null;
	}

	const interfaceContent = document.querySelector( INTERFACE_CONTENT_SELECTOR );

	if ( ! interfaceContent ) {
		return null;
	}

	const interfaceContentRect = interfaceContent.getBoundingClientRect();
	const width = node?.offsetWidth || DEFAULT_WINDOW_WIDTH;

	return clampWindowPosition(
		{
			x: interfaceContentRect.right - width - INTERFACE_CONTENT_INSET,
			y: interfaceContentRect.top + INTERFACE_CONTENT_INSET,
		},
		node
	);
}

function getDefaultWindowPosition( node ) {
	const interfaceContentPosition = getInterfaceContentWindowPosition( node );

	if ( interfaceContentPosition ) {
		return interfaceContentPosition;
	}

	const viewport = getViewport();

	return clampWindowPosition( {
		x: viewport.width - DEFAULT_WINDOW_WIDTH - WINDOW_MARGIN,
		y: 88,
	} );
}

function dispatchOpenWindowEvent() {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.dispatchEvent( new window.CustomEvent( OPEN_CONTENT_RESEARCH_WINDOW_EVENT ) );
}

function isBlockEmpty( block ) {
	if ( ! block ) {
		return true;
	}

	const textContent = Object.values( block.attributes ?? {} )
		.map( ( value ) => {
			if ( typeof value === 'string' ) {
				return value;
			}

			if ( value && typeof value === 'object' && typeof value.text === 'string' ) {
				return value.text;
			}

			return '';
		} )
		.join( '' )
		.replace( /<[^>]*>/g, '' )
		.trim();

	return textContent === '' && ( block.innerBlocks ?? [] ).every( isBlockEmpty );
}

function ContentResearchInspirationPrompt() {
	const hasBlocks = useSelect( ( select ) => {
		const blocks = select( 'core/block-editor' ).getBlocks();

		return blocks.some( ( block ) => ! isBlockEmpty( block ) );
	}, [] );
	const [ isReady, setIsReady ] = useState( false );

	useEffect( () => {
		if ( hasBlocks ) {
			setIsReady( false );
			return undefined;
		}

		const timeout = window.setTimeout( () => {
			setIsReady( true );
		}, 5000 );

		return () => {
			window.clearTimeout( timeout );
		};
	}, [ hasBlocks ] );

	if ( hasBlocks || ! isReady || typeof document === 'undefined' || ! document.body ) {
		return null;
	}

	return createPortal(
		<button
			className="content-research-inspiration-float"
			onClick={ dispatchOpenWindowEvent }
			type="button"
			aria-label={ __( 'Need inspiration?', 'content-research' ) }
		>
			<span className="content-research-inspiration-float__icon" aria-hidden="true">
				🔍
			</span>
			<span className="content-research-inspiration-float__text">
				{ __( 'Need inspiration?', 'content-research' ) }
			</span>
		</button>,
		document.body
	);
}

function ContentResearchPlugin() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ isDragging, setIsDragging ] = useState( false );
	const [ position, setPosition ] = useState( getDefaultWindowPosition );
	const windowRef = useRef( null );
	const dragStateRef = useRef( null );
	const shouldPinOnOpenRef = useRef( false );

	const openWindow = useCallback( () => {
		if ( ! isOpen ) {
			shouldPinOnOpenRef.current = true;
			setPosition( getDefaultWindowPosition( windowRef.current ) );
		}
		setIsOpen( true );
		setIsMinimized( false );
	}, [ isOpen ] );

	const closeWindow = useCallback( () => {
		setIsOpen( false );
		setIsDragging( false );
	}, [] );

	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return undefined;
		}

		window.addEventListener( OPEN_CONTENT_RESEARCH_WINDOW_EVENT, openWindow );

		return () => {
			window.removeEventListener( OPEN_CONTENT_RESEARCH_WINDOW_EVENT, openWindow );
		};
	}, [ openWindow ] );

	useLayoutEffect( () => {
		if ( ! isOpen || ! shouldPinOnOpenRef.current ) {
			return;
		}

		const interfaceContentPosition = getInterfaceContentWindowPosition( windowRef.current );

		if ( interfaceContentPosition ) {
			setPosition( interfaceContentPosition );
		}

		shouldPinOnOpenRef.current = false;
	}, [ isOpen ] );

	useEffect( () => {
		if ( ! isOpen || typeof window === 'undefined' ) {
			return undefined;
		}

		const handleResize = () => {
			setPosition( ( currentPosition ) =>
				clampWindowPosition( currentPosition, windowRef.current )
			);
		};

		handleResize();
		window.addEventListener( 'resize', handleResize );

		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [ isOpen, isMinimized ] );

	const startDrag = useCallback(
		( event ) => {
			if ( event.button !== 0 ) {
				return;
			}

			dragStateRef.current = {
				origin: position,
				pointerStart: {
					x: event.clientX,
					y: event.clientY,
				},
			};
			setIsDragging( true );
			event.currentTarget.setPointerCapture?.( event.pointerId );
			event.preventDefault();
		},
		[ position ]
	);

	const dragWindow = useCallback( ( event ) => {
		if ( ! dragStateRef.current ) {
			return;
		}

		const nextPosition = {
			x: dragStateRef.current.origin.x + event.clientX - dragStateRef.current.pointerStart.x,
			y: dragStateRef.current.origin.y + event.clientY - dragStateRef.current.pointerStart.y,
		};

		setPosition( clampWindowPosition( nextPosition, windowRef.current ) );
	}, [] );

	const stopDrag = useCallback( ( event ) => {
		event.currentTarget.releasePointerCapture?.( event.pointerId );
		dragStateRef.current = null;
		setIsDragging( false );
	}, [] );

	const toggleMinimized = useCallback( () => {
		setIsMinimized( ( current ) => ! current );
	}, [] );

	const windowClassName = [
		'content-research-window',
		isMinimized ? 'is-minimized' : '',
		isDragging ? 'is-dragging' : '',
	]
		.filter( Boolean )
		.join( ' ' );
	const windowElement = (
		<section
			ref={ windowRef }
			className={ windowClassName }
			role="dialog"
			aria-label={ __( 'Content Research', 'content-research' ) }
			style={ {
				'--content-research-window-x': `${ position.x }px`,
				'--content-research-window-y': `${ position.y }px`,
			} }
		>
			<header className="content-research-window__header">
				<div
					className="content-research-window__drag-handle"
					onPointerDown={ startDrag }
					onPointerMove={ dragWindow }
					onPointerUp={ stopDrag }
					onPointerCancel={ stopDrag }
					onDoubleClick={ toggleMinimized }
					role="presentation"
				>
					<Icon icon={ search } size={ 20 } />
					<span className="content-research-window__title">
						{ __( 'Content Research', 'content-research' ) }
					</span>
				</div>
				<div className="content-research-window__controls">
					<Button
						className="content-research-window__control"
						icon={ isMinimized ? chevronUp : chevronDown }
						label={
							isMinimized
								? __( 'Restore Content Research', 'content-research' )
								: __( 'Minimize Content Research', 'content-research' )
						}
						onClick={ toggleMinimized }
					/>
					<Button
						className="content-research-window__control"
						icon={ closeSmall }
						label={ __( 'Close Content Research', 'content-research' ) }
						onClick={ closeWindow }
					/>
				</div>
			</header>
			<div className="content-research-window__body" aria-hidden={ isMinimized }>
				<QueryClientProvider client={ queryClient }>
					<ContentResearchSidebar />
				</QueryClientProvider>
			</div>
		</section>
	);

	return (
		<>
			<KeyboardShortcuts
				bindGlobal
				shortcuts={ {
					[ CONTENT_RESEARCH_SHORTCUT ]: handleContentResearchShortcut,
				} }
			/>
			<PluginMoreMenuItem icon={ search } onClick={ openWindow }>
				{ __( 'Content Research', 'content-research' ) }
			</PluginMoreMenuItem>
			<ContentResearchInspirationPrompt />
			{ isOpen &&
				typeof document !== 'undefined' &&
				document.body &&
				createPortal( windowElement, document.body ) }
		</>
	);
}

registerPlugin( 'content-research', {
	render: () => <ContentResearchPlugin />,
} );
