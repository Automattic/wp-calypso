import { Popover } from '@wordpress/components';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ComponentProps, PointerEvent, ReactNode } from 'react';
import './style.scss';

type Mode = 'closed' | 'cursor' | 'element';
type Anchor = NonNullable< ComponentProps< typeof Popover >[ 'anchor' ] >;

// Only one explanation is visible at a time across the page.
let closeOpenTooltip: ( () => void ) | null = null;
// Moving straight from one term to the next swaps the text instead of replaying the entrance.
const HANDOFF_MS = 200;
let lastClosedAt = 0;

/**
 * A dark explanation that follows the cursor over a term, pins on click, and
 * anchors below the term for keyboard focus.
 */
export function useTermTooltip< T extends HTMLElement >( content: ReactNode ) {
	const id = useId();
	const ref = useRef< T >( null );
	const pointer = useRef( { x: 0, y: 0 } );
	const hovered = useRef( false );
	const [ mode, setMode ] = useState< Mode >( 'closed' );
	const [ isHandoff, setIsHandoff ] = useState( false );
	const [ pinned, setPinned ] = useState( false );
	const cursorAnchor = useRef< Anchor >( {
		get ownerDocument() {
			return ref.current?.ownerDocument;
		},
		// Popover remeasures this virtual anchor each frame as the cursor moves.
		getBoundingClientRect: () => {
			const { x, y } = pointer.current;
			const rect = { x, y, top: y, left: x, right: x, bottom: y, width: 0, height: 0 };
			return { ...rect, toJSON: () => rect };
		},
	} );

	const close = useCallback( () => {
		setPinned( false );
		setMode( ( current ) => {
			if ( current !== 'closed' ) {
				lastClosedAt = Date.now();
			}
			return 'closed';
		} );
	}, [] );

	const open = useCallback(
		( next: Exclude< Mode, 'closed' > ) => {
			if ( closeOpenTooltip && closeOpenTooltip !== close ) {
				closeOpenTooltip();
			}
			closeOpenTooltip = close;
			setIsHandoff( Date.now() - lastClosedAt < HANDOFF_MS );
			setMode( next );
		},
		[ close ]
	);

	useEffect(
		() => () => {
			if ( closeOpenTooltip === close ) {
				closeOpenTooltip = null;
			}
		},
		[ close ]
	);

	useEffect( () => {
		const ownerDocument = ref.current?.ownerDocument;
		if ( mode === 'closed' || ! ownerDocument ) {
			return;
		}
		const onKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				close();
			}
		};
		const onPointerDown = ( event: globalThis.PointerEvent ) => {
			if ( ! ref.current?.contains( event.target as Node ) ) {
				close();
			}
		};
		ownerDocument.addEventListener( 'keydown', onKeyDown );
		ownerDocument.addEventListener( 'pointerdown', onPointerDown );
		return () => {
			ownerDocument.removeEventListener( 'keydown', onKeyDown );
			ownerDocument.removeEventListener( 'pointerdown', onPointerDown );
		};
	}, [ mode, close ] );

	const trackPointer = ( event: PointerEvent< T > ) => {
		pointer.current = { x: event.clientX, y: event.clientY };
	};

	const isOpen = mode !== 'closed';
	const triggerProps = {
		ref,
		'aria-describedby': isOpen ? id : undefined,
		onPointerEnter: ( event: PointerEvent< T > ) => {
			if ( event.pointerType === 'touch' ) {
				return;
			}
			hovered.current = true;
			trackPointer( event );
			if ( ! pinned ) {
				open( 'cursor' );
			}
		},
		onPointerMove: trackPointer,
		onPointerLeave: () => {
			hovered.current = false;
			if ( ! pinned ) {
				close();
			}
		},
		onFocus: () => {
			if ( ! hovered.current && ! pinned ) {
				open( 'element' );
			}
		},
		onBlur: () => {
			if ( ! hovered.current && ! pinned ) {
				close();
			}
		},
		onClick: () => {
			if ( pinned ) {
				close();
				return;
			}
			setPinned( true );
			open( 'element' );
		},
	};

	const tooltip = isOpen && (
		<Popover
			id={ id }
			role="tooltip"
			className="agency-term-tooltip"
			anchor={ mode === 'cursor' ? cursorAnchor.current : ref.current }
			placement={ mode === 'cursor' ? 'bottom-start' : 'bottom' }
			offset={ 14 }
			variant="unstyled"
			animate={ false }
			focusOnMount={ false }
			resize={ false }
			shift
			onClose={ close }
		>
			<div className="agency-term-tooltip__content" data-handoff={ isHandoff || undefined }>
				{ content }
			</div>
		</Popover>
	);

	return { triggerProps, tooltip, isOpen, isPinned: pinned };
}
