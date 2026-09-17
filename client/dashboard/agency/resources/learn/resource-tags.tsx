import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type Tag = { field: string; value: string };

export default function ResourceTags( {
	tags,
	onFilter,
}: {
	tags: Tag[];
	onFilter: ( field: string, value: string ) => void;
} ) {
	const scroller = useRef< HTMLDivElement >( null );
	const animation = useRef( 0 );
	const resetTimer = useRef( 0 );
	const stopScrolling = () => {
		cancelAnimationFrame( animation.current );
		window.clearTimeout( resetTimer.current );
	};
	useEffect(
		() => () => {
			cancelAnimationFrame( animation.current );
			window.clearTimeout( resetTimer.current );
		},
		[]
	);
	const returnToStart = () => {
		stopScrolling();
		resetTimer.current = window.setTimeout( () => {
			const element = scroller.current;
			if ( ! element || element.querySelector( ':focus-visible' ) ) {
				return;
			}
			if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
				element.scrollLeft = 0;
				return;
			}
			const initial = element.scrollLeft;
			const started = performance.now();
			const restore = ( now: number ) => {
				const progress = Math.min( 1, ( now - started ) / 600 );
				element.scrollLeft = initial * Math.pow( 1 - progress, 3 );
				if ( progress < 1 ) {
					animation.current = requestAnimationFrame( restore );
				}
			};
			animation.current = requestAnimationFrame( restore );
		}, 800 );
	};
	const startScrolling = () => {
		stopScrolling();
		const element = scroller.current;
		if ( ! element || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
			return;
		}
		const sign = getComputedStyle( element ).direction === 'rtl' ? -1 : 1;
		let previous = performance.now() + 300;
		const advance = ( now: number ) => {
			if ( now > previous ) {
				const remaining =
					element.scrollWidth - element.clientWidth - Math.abs( element.scrollLeft );
				if ( remaining <= 1 ) {
					return;
				}
				element.scrollLeft += sign * Math.min( remaining, ( now - previous ) * 0.035 );
				previous = now;
			}
			animation.current = requestAnimationFrame( advance );
		};
		animation.current = requestAnimationFrame( advance );
	};
	const [ edges, setEdges ] = useState( { left: false, right: false } );
	const updateEdges = () => {
		const element = scroller.current;
		if ( ! element ) {
			return;
		}
		const bounds = element.getBoundingClientRect();
		const first = element.firstElementChild?.getBoundingClientRect();
		const last = element.lastElementChild?.getBoundingClientRect();
		if ( ! first || ! last ) {
			return;
		}
		const left = Math.min( first.left, last.left ) < bounds.left - 1;
		const right = Math.max( first.right, last.right ) > bounds.right + 1;
		setEdges( ( current ) =>
			current.left === left && current.right === right ? current : { left, right }
		);
	};
	useLayoutEffect( () => {
		const element = scroller.current;
		if ( ! element ) {
			return;
		}
		const observer = new ResizeObserver( updateEdges );
		observer.observe( element );
		Array.from( element.children ).forEach( ( child ) => observer.observe( child ) );
		updateEdges();
		return () => observer.disconnect();
	}, [ tags ] );
	return (
		<div
			className="resource-tags-bleed"
			data-overflow-left={ edges.left }
			data-overflow-right={ edges.right }
		>
			<HStack
				ref={ scroller }
				tabIndex={ -1 }
				onScroll={ updateEdges }
				onPointerEnter={ ( event ) => {
					if ( event.pointerType === 'mouse' ) {
						startScrolling();
					}
				} }
				onPointerLeave={ returnToStart }
				onPointerDown={ stopScrolling }
				onFocusCapture={ stopScrolling }
				onWheel={ stopScrolling }
				className="resource-tags"
				spacing={ 1 }
				justify="start"
				expanded={ false }
			>
				{ tags.map( ( tag ) => (
					<button
						key={ tag.field }
						type="button"
						tabIndex={ -1 }
						className="resource-tag"
						aria-label={
							/* translators: %s is a resource tag. */
							sprintf( __( 'Filter by %s' ), tag.value )
						}
						onClick={ () => onFilter( tag.field, tag.value ) }
					>
						<Badge intent={ tag.field === 'featured' ? 'informational' : 'draft' }>
							{ tag.value }
						</Badge>
					</button>
				) ) }
			</HStack>
		</div>
	);
}
